// JavaScript source code
var Promise = require('bluebird');
var redis = Promise.promisifyAll(require("redis"));

var url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
var pub = redis.createClient(url);
var sub = redis.createClient(url);
sub.psubscribe('Rooms/*', 'Games/*', 'StartGame/*', 'EndGame/*', 'CreateGame/*', 'Input/*');
var flushPromise = pub.flushdbAsync();

var Lock = require('./lock.js')(pub);

//Applies a set of transaction modifications for every user in a given room. Returns promise returning transaction
//action takes (trans, userId)
function broadcast(trans, roomId, action, extra){
    return pub.multi().smembers(roomId).execAsync()
    .then(function(batch){
        var room = batch[0];
        if (extra) room.push(extra);
        room.map(userId=>action(trans, userId));
        return trans;
    });
}

//Releases some locks then throws
function safeThrow(message, locks){
    Lock.multiUnlock(locks)
    .then(()=>{throw message;});
}

//Generates function that cleans up the locks at end of transaction. Put in .finally
function transUnlock(locks){
    return function(){
        return Lock.multiUnlock(locks);
    }
}

//Generates a retry continuation in case a transaction fails due to locking. Put in .catch
function transRetry(func, ...args){
    return function (err) {
        //If locking error is caught, log it and apply the input args to the function to try again
        if (err === 'LockFailed') {
            console.log('transaction retry');
            return func.apply(undefined, args);
        }
        //Propagate other errors to transUnlock, which will 
        throw err;
    }
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
        (trans, userId) => trans.publish('StartGame/' + userId, '').hset(userId, 'room', gameId),
        newUser);
    //TODO add logic for creating game object
}

//Let user join an available room
function joinRoom(roomId, userId) {
    //Prepend Room: in front of id
    var gameId = 'Game:' + roomId;
    roomId = 'Room:' + roomId;
    //These 3 resources need to be locked for the transaction
    var locks = [Lock(roomId), Lock(userId), Lock(gameId)];

    //Set locks
    return Lock.multiLock(locks)
    //See if user has already been registered. If so, stop immediately to prevent same user getting added twice
    .then(()=>pub.multi().exists(userId)
     //Make sure a game with same id doesnt exist to prevent game overwrite attacks
    .exists(gameId)
    //Check # of users in room
    .scard(roomId).execAsync())
    .then(function (results) {
        var userExists = results[0];
        var gameExists = results[1];
        var len = results[2];
        if (userExists){
            throw 'UserExists'
        }
        if (gameExists) {
            throw 'GameExists'
        }
        //If room is full, reject the join
        if (len >= 2) {
            throw "FullRoom"
        }
        else {
            //User is added to room regardless
            var trans = addUser2Room(pub.multi(), roomId, userId);
            //If room is empty/doesnt exist, add the room and then add the user to the room 
            if (len === 0) {
                return addRoom(trans, roomId).execAsync();
            }
            //If room has 1 member, add new user and upgrade the room to a game room
            else{
                return upgradeRoom(trans, roomId, userId)
                .then( (trans)=> trans.execAsync() );
            }
        }
    })
    .finally(transUnlock(locks)).catch(transRetry(joinRoom, roomId, userId));
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
    var locks = [Lock(userId)];
    //First lock user
    return locks[0].lock()
    //Find room the user is mapped to
    .then(()=>pub.multi().hget(userId, 'room').execAsync())
    .then(function (batch) {
        var roomId = batch[0] || ' ';
        //The user will be deleted from redis regardless of the outcome
        var trans = pub.multi().del(userId);
        //Add room lock
        var roomLock = Lock(roomId)
        locks.push(roomLock);
        var lkPromise = roomLock.lock();
        //If the room is an available room, lock the room and check if the user is the last one
        if (roomId.startsWith('Room:')){
            return lkPromise.then(()=>pub.multi().scard(roomId).execAsync())
            .then(function(batch){
                var len = batch[0];
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
        //If the room is a game room, lock the room and handle the user disconnection
        else if (roomId.startsWith('Game:')){
            return lkPromise.then(()=>disconnectGame(trans, roomId))
            .then( trans=>trans.execAsync() );
        }
        //The room isnt an actual room, so just delete user
        else{
            return trans.execAsync();
        }
    })
    //If transaction fails from watch, try again
    .finally(transUnlock(locks)).catch(transRetry(leaveRoom, userId));
}

//Retrieve all available rooms without the Room: prefix
function getRooms(){
    return pub.smembersAsync('availableRooms')
    .then(rooms=>rooms.map(roomId=>roomId.replace('Room:', '')));
}

//Have the player select a character after joining a game
function selectChar(userId, character){
    var room, chars, gameId;
    var locks = [Lock(userId)];
    return locks[0].lock()
    //Find out which room the user is in
    .then(()=>pub.multi().hget(userId, 'room').execAsync())
    .then(function (batch) {
        var roomId = batch[0];
        //Gather all members in the user's room
        if (roomId && roomId.startsWith('Game:')) {
            //Lock the room
            var roomLock = Lock(roomId);
            locks.push(roomLock);
            gameId = roomId;
            return roomLock.lock().then(()=>pub.multi().smembers(roomId).execAsync());
        }
        //If user doesnt exist or is not in game room, throw error
        throw 'UnregisteredUser';
    })
    .then(function(batch){
        room = batch[0];      
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
    })
    .finally(transUnlock(locks)).catch(transRetry(selectChar, userId, character));
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