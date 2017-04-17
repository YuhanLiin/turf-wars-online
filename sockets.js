var socketio = require('socket.io');
var repo = require('./repository');
var shortid = require('shortid');

var validCharNames = ['Slasher', 'Blaster'];

function init(http){
    var io = socketio(http);
    //The main room where the user agregation and actual game takes place
    io.of('room').on('connect', function (socket) {
        socket.on('error', function(err){
            console.log(err);
        });

        //The client immediately sends a roomId event to the server, which makes socket join the room
        socket.on('roomId', function(roomId){
            //If invalid id is given (XSS attack), emit error string
            if (!roomId || !shortid.isValid(roomId)) socket.emit('issue', 'InvalidRoomId');
            else repo.joinRoom(roomId, socket.id).catch((err)=>socket.emit('issue', err));
        });

        //When character is selected, check if the character is valid send the info to repo
        socket.on('selectChar', function (char) {
            if (!validCharNames.includes(char)) socket.emit('issue', 'InvalidCharacter');
            else repo.selectChar(socket.id, char).catch((err)=>socket.emit('issue', err));
        });

        var ownedGame;
        function pubsubHandler(pattern, channel, message) {
            if (channel === 'StartGame/' + socket.id) {
                socket.emit('startGame', message);
            }
            else if (channel === 'CreateGame/' + socket.id) {
                //Debug purposes
                socket.emit('createGame', '');
                var gameJson = JSON.parse(message);
                ownedGame = gameJson.gameId;
                //TODO add logic for creating the game
            }
            else if (channel === 'EndGame/disconnect/' + socket.id) {
                socket.emit('disconnectWin', message);
            }
        }
        repo.sub.on("pmessage", pubsubHandler);
        
        //Leave room on disconnect 
        socket.on("disconnect", function () {
            repo.leaveRoom(socket.id)
            .catch(err=> console.log(err));
            repo.sub.removeListener("pmessage", pubsubHandler);
        });
    });

    //The lobby where all available rooms are shown
    io.of('lobby').on('connect', function (socket) {
        socket.on('error', function(err){
            console.log(err);
        });

        //Redirect all Rooms/ redis notifications to the socket
        function pubsubHandler(pattern, channel, message){
            if (pattern === 'Rooms/*')
                socket.emit(channel.replace('Rooms/', ''), message.replace('Room:', ''));
        }
        repo.sub.on("pmessage", pubsubHandler);

        //Clean up the handler after disconnecting
        socket.on('disconnect', function (){
            repo.sub.removeListener("pmessage", pubsubHandler);
        })
    });
    return io;
}

module.exports.init = init;