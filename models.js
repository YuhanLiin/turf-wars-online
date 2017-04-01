function Room(roomId, hostId) {
    return Object.assign(Object.create(Room.prototype), 
        { id: roomId, host: hostId });
}
Room.prototype = {};

module.exports.Room = Room;
