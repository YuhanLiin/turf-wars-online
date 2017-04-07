// JavaScript source code
var bluebird = require('bluebird');
var redis = bluebird.promisifyAll(require("redis"));

var url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
var pub = redis.createClient(url);
var sub = redis.createClient(url);
sub.psubscribe('Rooms/*', 'Games/*', 'StartGame/*', 'EndGame/*', 'CreateGame/*', 'Input/*');
var flushPromise = pub.flushdbAsync();

//Applies a set of transaction modifications for every user in a given room. Returns promise returning transaction
//action takes (trans, userId)
function broadcast(trans, roomId, action, extra){
    return pub.smembersAsync(roomId)
    .then(function(room){
        if (extra) room.push(extra);
        room.map(userId=>action(trans, userId));
        return trans;
    });
}

//Unwatches then throws
function safeThrow(message){
    pub.unwatch();
    throw message;
}

//Append actions for adding a room to a transaction
function addRoom(trans, id) {
    return trans.sadd('availableRooms', id).publish('Rooms/add', id);
}
//Append actions for adding a user to a room to a transaction
function addUser2Room(trans, roomId, userId){
    return trans.sadd(roomId, userId).hset(userId, 'room', roomId); //set user object's room mapping
}

//Append to transaction steps for turning an available room into a game room. 
//Returns promise that returns the transaction
function upgradeRoom(trans, roomId, newUser){
    //The new id with the Game: prefix
    var gameId = roomId.replace('Room:', 'Game:');
    //First delete the room from the available rooms
    trans.srem('availableRooms', roomId).publish('Rooms/delete', roomId)
    //Then rename the room and add it to game rooms
    .rename(roomId, gameId).sadd('gameRooms', gameId).publish('Games/add', gameId);
    //Send start game notifications to everyone in the room and change their room mappings  
    return broadcast(trans, roomId, 
        (trans, userId)=>trans.publish('StartGame/'+userId, '').hset(userId, 'room', gameId),
        newUser);
    //TODO add logic for creating game object
}

//Let user join an available room
function joinRoom(roomId, userId) {
    //Prepend Room: in front of id
    var gameId = 'Game:' + roomId;
    roomId = 'Room:' + roomId;
    //These variables are the ones that get checked, so they need to be watched
    pub.watch(roomId);
    pub.watch(userId);
    pub.watch(gameId);
    //First see if user has already been registered. If so, stop immediately to prevent same user getting added twice
    return pub.existsAsync(userId)
    .then(function(reply){
        if (reply){
            safeThrow('UserExists');
        }
    })
    //Make sure a game with same id doesnt exist to prevent game overwrite attacks
    .then(()=>pub.existsAsync(gameId))
    .then(function(reply){
        if (reply){
            safeThrow('GameExists');
        }
    })
    //Check # of users in room
    .then(()=>pub.scardAsync(roomId))
    .then(function (len) {
        //If room is full, reject the join
        if (len >= 2) {
            safeThrow("FullRoom");
        }
        else {
            //User is added to room regardless
            var trans = addUser2Room(pub.multi(), roomId, userId);
            //If room is empty/doesnt exist, add the room and then add the user to the room 
            if (len === 0){
                return addRoom(trans, roomId).execAsync();
            }
            //If room has 1 member, add new user and upgrade the room to a game room
            else{
                return upgradeRoom(trans, roomId, userId)
                .then( (trans)=> trans.execAsync() );
            }
        }
    })   
    //If transaction fails because of watch, try it again
    .then(function(reply){
        if (reply === null)
            return joinRoom(roomId, userId);
        return reply;
    });
}

//Append actions for deleting a room to a transaction
function deleteRoom(trans, id) {
    return trans.srem('availableRooms', id).del(id).publish('Rooms/delete', id);
}

//Append action for deleting a game after a user disconnects. Returns promise
function disconnectGame(trans, roomId) {
    //Delete the game room and send corresponding notification
    trans.del(roomId).srem('gameRooms', roomId).publish('Games/delete', roomId);
    //Send a disconnected notification to all remaining users and disconnect them
    return broadcast(trans, roomId, 
        (trans, userId)=>trans.publish('EndGame/disconnect/'+userId, '').del(userId));
    //TODO clean up game object
}

//Let a user leave his current room
function leaveRoom(userId) {
    pub.watch(userId);
    //Find room the user is mapped to
    return pub.hgetAsync(userId, 'room')
    .then(function (roomId) {
        if (!roomId) roomId = '';
        //The user will be deleted from redis regardless of the outcome
        var trans = pub.multi().del(userId);
        //Watch the room
        pub.watch(roomId);
        //If the room is an available room, check if the user is the last one
        if (roomId.startsWith('Room:')){
            return pub.scardAsync(roomId)
            .then(function(len){
                //If so, delete the whole room
                if (len <= 1){
                    return deleteRoom(trans, roomId).execAsync();
                }
                //Otherwise, remove the user from the room
                else{
                    return trans.srem(roomId, userId).execAsync();
                }
            });
        }
        //If the room is a game room, handle the user disconnection
        else if (roomId.startsWith('Game:')){
            return disconnectGame(trans, roomId)
            .then( trans=>trans.execAsync() );
        }
        else{
            return trans.execAsync();
        }
    })
    //If transaction fails from watch, try again
    .then(function(reply){
        if (reply===null){
            return leaveRoom(userId);
        }
        return reply;
    });
}

//Retrieve all available rooms without the Room: prefix
function getRooms(){
    return pub.smembersAsync('availableRooms')
    .then(rooms=>rooms.map(roomId=>roomId.replace('Room:', '')));
}

//Have the player select a character after joining a game
function selectChar(userId, character){
    var room, chars, gameId;
    pub.watch(userId);
    //Find out which room the user is in
    return pub.hgetAsync(userId, 'room')
    .then(function (roomId) {
        //Gather all members in the user's room
        if (roomId && roomId.startsWith('Game:')) {
            pub.watch(roomId);
            gameId = roomId;
            return pub.smembersAsync(roomId);
        }
        //If user doesnt exist or is not in game room, throw error
        safeThrow('UnregisteredUser');
    })
    .then(function(roomList){      
        room = roomList;
        //Make a list of the characters each user has picked so far
        var promises = room.map(function(otherUser){
            if (otherUser !== userId) return pub.hgetAsync(otherUser, 'character');
            else return Promise.resolve(character);
        });
        return Promise.all(promises)
        //See if everyone has picked a character
        .then(function (results) {
            chars = results;
            return results.reduce((acc, val) =>acc && val)
        });
    })
    .then(function (allSelected) {
        //Regardless of result, the user's character mapping will be updated
        var trans = pub.multi().hset(userId, 'character', character);
        //If everyone has selected a char, then tell the last user to create the game on its server
        if (allSelected) {
            //Send the mappings and the gameId to the user to create game and set handler for this specific game
            var charMappings = {'gameId': gameId};
            room.map((userId, i) =>charMappings[userId] = chars[i]);
            return trans.publish('CreateGame/'+userId, JSON.stringify(charMappings)).execAsync();
        }
        return trans.execAsync();
    });
}

//Publish an input notification to the user's game. Message is user's id and the contents of notification
function notifyGame(userId, message) {
    return pub.hgetAsync(userId, 'room')
    .then(function (gameId) {
        if (gameId){
            return pub.multi().publish(`Input/${gameId}`, `${userId}:${message}`).execAsync();
        }
        return Promise.resolve();
    });
}

module.exports.flushPromise = flushPromise;
module.exports.pub = pub;
module.exports.sub = sub;
module.exports.joinRoom = joinRoom;
module.exports.leaveRoom = leaveRoom;
module.exports.getRooms = getRooms;
module.exports.selectChar = selectChar;
module.exports.notifyGame = notifyGame;