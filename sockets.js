var socketio = require('socket.io');
var shortid = require('shortid');
var repo = require('./repository');
var createGame = require('./bootstrapper.js');

var validCharNames = Object.keys(require('./game/game.js').roster);

function init(http){
    var io = socketio(http);
    //Web sockets only
    io.set('transports', ['websocket']);
    //The main room where the user aggregation and actual game takes place
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

        //Verify and send input code to game
        socket.on('input', function(inputCode){
            if (inputCode.length === 3){
                repo.sendInput(socket.id, inputCode).catch(console.log);
            }
        });

        var opponent;
        function pubsubHandler(pattern, channel, message) {
            if (channel === 'StartGame/' + socket.id) {
                socket.emit('startGame', message);
            }
            else if (channel === 'CreateGame/' + socket.id) {
                //Creates the game from the given json of character mappings
                var gameMap = JSON.parse(message);
                createGame(message)
            }
            else if (channel === 'StartMatch/' + socket.id) {
                var gameMap = JSON.parse(message);
                //Modify the gameMap for client use by replacing the socket ids with the terms 'you' and 'opponent'
                var clientMap = gameMap.map(function(pair){
                    let player = pair[0], charName = pair[1];
                    if (player === socket.id) player = 'you';
                    else {
                        opponent = player;
                        player = 'opponent';
                    }
                    return [player, charName];
                });
                socket.emit('startMatch', clientMap);
            }
            else if (channel === 'Update/' + opponent) {
                //Should update opponent with game state
                socket.emit('oUpdate', message);
            }
            else if (channel.startsWith('EndGame/') && channel.endsWith(socket.id)) {
                //Send the middle action portion of the end game channel as event for client
                var action = channel.replace('EndGame/', '').replace('/'+socket.id, '');
                socket.emit(action, message);
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