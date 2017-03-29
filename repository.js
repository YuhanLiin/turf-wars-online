// JavaScript source code
var redis = require("redis");

//Need to add config
var url = process.env.REDIS_URL || "redis://h:p55843f5bc6952dfc491bba4494b013e5c0dd8b96f42ad6bf39156327a26a50a8@ec2-34-206-56-30.compute-1.amazonaws.com:16869";
var pub = redis.createClient(url);
var sub = redis.createClient(url);
sub.subscribe('Rooms/*');
pub.flushdb();

//Might be changed later
function toRoomId(socketId) {
    return "room:" + socketId
}

function Room(roomId, hostId, guestId) {
    return { id: roomId, host: hostId, guestId: guestId};
}

function addRoom(hostId, callback = (e, r) => { }) {
    var roomId = toRoomId(hostId);
    pub.multi().hset(roomId, 'host', hostId).sadd('availableRooms', roomId).exec(function (err, unused) {
        var room = Room(roomId, hostId);
        if (!err) pub.publish("Rooms/add", JSON.stringify(room));
        callback(err, room);
    });
}

function deleteRoom(hostId, callback = (e, r) => { }) {
    var roomId = toRoomId(hostId);
    pub.multi().del(roomId).srem('availableRooms', roomId).exec(function (err, reply) {
        if (!err) pub.publish('Rooms/delete', roomId);
        callback(err, reply);
    });
}

function getRooms(callback = (e, r) => { }){
    pub.smembers('availableRooms', function(err, reply){
        if (err) callback(err, reply);
        else {
            var rooms = [];
            for (let i=0; i<reply.length; i++){
                let roomId = reply[i];
                pub.hgetall(roomId, function(err, data){
                    if (err) console.log(err.stack);
                    else rooms.push(data);
                });
            }
            //Run callback with the list of rooms as a param
            callback(err, rooms);
        }
    });
}

module.exports.pub = pub;
module.exports.sub = sub;
module.exports.addRoom = addRoom;
module.exports.deleteRoom = deleteRoom;
module.exports.getRooms = getRooms;