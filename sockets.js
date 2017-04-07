var socketio = require('socket.io');
var repo = require('./repository');
var shortid = require('shortid');

function init(http){
    var io = socketio(http);
    //The main room where the user agregation and actual game takes place
    io.of('room').on('connect', function (socket) {
        //Propagate errors back to client via 'issue' event
        socket.on('error', function(err){
            socket.emit('issue', error);
            console.log(err);
        });

        //The client immediately sends a roomId event to the server, which makes socket join the room
        socket.on('roomId', function(roomId){
            //If invalid id is given (XSS attack), emit error string
            if (!shortid.isValid(roomId)) socket.emit('issue', 'InvalidRoomId');
            repo.joinRoom(roomId, socket.id);
        });

        //When character is selected, check if the character is valid (TODO) send the info to repo
        socket.on('selectChar', function(char)){
            repo.selectChar(socket.id, char);
        }

        var ownedGame;
        function pubsubHandler(pattern, channel, message) {
            if (channel === 'StartGame/' + socket.id) {
                socket.emit('startGame');
            }
            else if (channel === 'CreateGame/' + socket.id) {
                socket.emit('createGame');
                var gameJson = JSON.parse(message);
                ownedGame = gameJson.gameId;
                //TODO add logic for creating the game
            }
            else if (channel === 'EndGame/disconnect' + socket.id) {
                socket.emit('disconnectWin');
                //TODO add logic for cleaning up the game
            }
            else if(ownedGame){
                if (channel.startsWith('Input/'+ownedGame)){
                    var userAndInput = message.split(':');
                    //TODO put this into game obj
                }
            }
        }
        repo.sub.on("pmessage", pubsubHandler);
        
        //Leave room on disconnect 
        socket.on("disconnect", function () {
            repo.sub.removeListener("pmessage", pubsubHandler);
            repo.leaveRoom(socket.id)
            .catch(err=> console.log(err));
        });
    });

    //The lobby where all available rooms are shown
    io.of('lobby').on('connect', function (socket) {

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