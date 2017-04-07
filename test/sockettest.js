var io = require('socket.io-client');
var repo = require('../repository.js');
var sid = require('shortid').generate;
var assert = require('assert');

var sockets = require('../sockets.js');
var http = require('http').createServer();
sockets.init(http);
http.listen(5000);
var url = 'http://localhost:5000';

function ClientClass(room, events) {
    return function (cb=()=>{}) {
        var socket = io(url+room);
        socket.notifs = [];
        for (let i = 0 ; i < events.length; i++) {
            let event = events[i];
            socket.on(event, message=>socket.notifs.push(event + message));
        }
        socket.on('connect', cb);
        return socket;
    }
}

var RoomClient = ClientClass('/room', ['issue', 'startGame', 'createGame', 'disconnectWin']);

var LobbyClient = ClientClass('/lobby', ['issue', 'add', 'delete']);

describe('/room', function () { 
    after(function (done) {
        repo.pub.flushdb(done);
    });

    it('should deny bad ids', function (done) {
        var client = RoomClient();
        client.emit('roomId', '55')
        client.on('issue', function(msg){
            assert.deepStrictEqual(client.notifs, ['issueInvalidRoomId']);
            client.disconnect();
            done();
        });
    });

    it.only('should start game when 2 players are in the room', function (done) {
        this.timeout(1000);
        var id = sid();
        var c2 = RoomClient();
        c2.emit('roomId', id)
        var c3 = RoomClient();
        c3.emit('roomId', id)
        c2.on('startGame', function(){
            done();
        })
        setTimeout(function () {
            //assert.deepStrictEqual(c2.notifs, ['startGame']);
            //assert.deepStrictEqual(c3.notifs, ['startGame']);
        }, 1000);
        
    });
    
    it('should deny game when a game room exists with same id', function (done) {
        var id = sid();
        var c1 = RoomClient();
        var c2 = RoomClient();
        var c3 = RoomClient();
        setTimeout(function () {
            assert.deepStrictEqual(c3.notifs, ['issueGameExists']);
            done();
        }, 200);  
    })
})