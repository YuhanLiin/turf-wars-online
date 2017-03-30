// JavaScript source code
var redis = require("redis");

var models = require("./models.js");

//Need to add config
var url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
var pub = redis.createClient(url);
var sub = redis.createClient(url);
sub.subscribe('Rooms/add', 'Rooms/delete');
pub.flushdb();

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