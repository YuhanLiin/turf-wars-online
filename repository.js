// JavaScript source code
var promisify = require('promisify-node');
var redis = promisify("redis");

var models = require("./models.js");

//Need to add config
var url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
var pub = redis.createClient(url);
var sub = redis.createClient(url);
sub.subscribe('Rooms/add', 'Rooms/delete');
pub.flushdb();

//Return transaction for adding room to redis
function addRoom(id) {
    return redis.multi().sadd('availableRooms', id);
}

//Let user join an available room
function joinRoom(roomId, userId) {
    var trans;
    //Check if the room exists
    return redis.sismember('availableRooms', roomId)
    .then(function (reply) {
        //If room exists, check its length
        if (reply) {
            return redis.scard(roomId)
            .then(function (len) {
                if (len < 2) {
                    trans = redis.multi();
                }
                else { console.log('FullRoom'); }
            });
        }
        //Otherwise, start the transaction by adding the new room
        else {
            trans = addRoom(roomId);
        }
    })
    .then(function () {
        //Add the user into the room and also register the user in redis w/e a full transaction
        redis.watch(roomId);
        return trans.sadd(roomId, userId).hset(userId, 'room', roomId).exec();
    });
}

//Delete a room if data associated with it does not change
function deleteRoom(id) {
    redis.watch(id);
    return redis.multi().srem('availableRooms', id).exec();
}

function leaveRoom(userId) {
    var roomId;
    //Find room the user is mapped to
    return redis.hget(userId, 'room')
    .then(function (room) {
        //Remove the user from redis and also the room
        roomId = room;
        return redis.multi().srem(roomId, userId).del(userId).exec();
    })
        //Check if the room is empty. If so, delete it
    .then(function () { return redis.scard(roomId); })
    .then(function (len) {
        if (len === 0) {
            return deleteRoom(roomId);
        }
    });
}

//Might be changed later
function toRoomId(socketId) {
    return socketId;
}

function addRoom(hostId) {
    return new Promise(function(resolve, reject){
        var roomId = toRoomId(hostId);
        var room = models.Room(roomId, hostId);
        pub.multi().hmset("Room:"+roomId, room).sadd('availableRooms', roomId).exec(function (err, unused) {
            if (err) reject(err);
            else{
                pub.publish("Rooms/add", JSON.stringify(room));
                resolve();
            }
        });
    });
}

function deleteRoom(hostId) {
    return new Promise(function(resolve, reject){
        var roomId = toRoomId(hostId);
        pub.multi().del("Room:" + roomId).srem('availableRooms', roomId).exec(function (err, reply) {
            if (err) reject(err);
            else{
                pub.publish('Rooms/delete', roomId);
                resolve();
            }
        });
    });
}

function getRooms() {
    return new Promise(function (resolve, reject) {
        pub.smembers('availableRooms', function (err, roomIds) {
            if (err) reject(err);
            else {
                resolve(roomIds);
            }
        });
    })
    .then(function (roomIds) {
        return Promise.all(roomIds.map(function (id) {
            return new Promise(function (resolve, reject) {
                pub.hgetall("Room:" + id, function (err, data) {
                    if (err) reject(err);
                    else {
                        resolve(data);
                    }
                });
            });
        }));
    });
}

module.exports.pub = pub;
module.exports.sub = sub;
module.exports.addRoom = addRoom;
module.exports.deleteRoom = deleteRoom;
module.exports.getRooms = getRooms;