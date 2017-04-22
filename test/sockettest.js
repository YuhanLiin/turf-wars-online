describe('sockets', function(){
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

    var RoomClient = function(roomId){
        var socket = ClientClass('/room', ['issue', 'startGame', 'disconnectWin'])
        (()=>socket.emit('roomId', roomId));
        return socket;
    }

    var LobbyClient = ClientClass('/lobby', ['issue', 'add', 'delete']);


    describe('/room joining and leaving', function () { 
        afterEach(function (done) {
            repo.pub.flushdb(done);
        });

        it('should deny bad ids', function (done) {
            var client = RoomClient('55');
            client.on('issue', function(msg){
                assert.deepStrictEqual(client.notifs, ['issueInvalidRoomId']);
                client.disconnect();
                done();
            });
        });

        it('should start game when 2 players are in the room', function (done) {
            var id = sid();
            var c2 = RoomClient(id);
            var c3 = RoomClient(id);
            c3.on('startGame', function(){
                assert.deepStrictEqual(c2.notifs, ['startGame']);
                assert.deepStrictEqual(c3.notifs, ['startGame']);
                done();
            })           
        });
        
        it('should deny game when a game room exists with same id', function (done) {
            var id = sid();
            var c1 = RoomClient(id);
            var c2 = RoomClient(id);
            c2.on('startGame', function(){
                var c3 = RoomClient(id);
                c3.on('issue', function(issue){
                        assert.strictEqual(issue, 'GameExists');
                        c1.disconnect();
                        c2.disconnect();
                        c3.disconnect();
                        done();
                }); 
            }); 
        });

        it('should deny same user joining twice', function(done){
            var c = RoomClient(sid());
            c.emit('roomId', sid());
            c.on('issue', function(issue){
                assert.strictEqual(issue, 'UserExists');
                c.disconnect();
                done()
            })
        });

        it('should deny requests on full rooms', function(done){
            var finish = message=>{console.log(message); done()};
            var id = sid();
            var c1 = RoomClient(id);
            var c2 = RoomClient(id);
            var c3 = RoomClient(id);
            c1.on('issue', finish); 
            c2.on('issue', finish); 
            c3.on('issue', finish); 
        })
    })

    describe('/room selectChar and leaving games', function(){
        var socket1, socket2;
        var id

        afterEach(function (done) {
            repo.pub.flushdb(done);
        });

        beforeEach(function(done){
            id = sid()
            socket1 = RoomClient(id);
            socket2 = RoomClient(id);
            socket2.on('startGame', function(){
                done();
            })
        });

        it('should deny invalid character names', function(done){
            socket1.emit('selectChar', 'invalid');
            socket1.on('issue', function(err){
                assert.strictEqual(err, 'InvalidCharacter');
                done();
            })
        });

        it('should deny users that are not in a game', function(done){
            var c = RoomClient(sid());
            c.emit('selectChar', 'Slasher');
            c.on('issue', function(err){
                assert.strictEqual(err, 'UnregisteredUser');
                done();
            })
        });

        it('should delete the entire game once a user leaves', function(done){
            socket1.on('disconnectWin', done);
            socket2.disconnect();
        });

        it('should create game and start client matches when both characters are selected', function(done){
            //Prevent done from being called twice
            var isDone = false;
            socket2.on('startMatch', function(message){
                assert.deepStrictEqual(message, {you:'Slasher', opponent:'Slasher'});
                if (!isDone){
                    isDone = true;
                    done();
                }
            });
            socket1.on('startMatch', function(message){
                assert.deepStrictEqual(message, {you:'Slasher', opponent:'Slasher'});
                if (!isDone){
                    isDone = true;
                    done();
                }
            });
            socket1.emit('selectChar', 'Slasher');
            socket2.emit('selectChar', 'Slasher');
        });

        it('should not race between selectChar and leaveRoom', function(done){
            socket2.on('disconnectWin', ()=>setTimeout(function(){
                done();
            }, 100));
            socket1.emit('selectChar', 'Slasher');
            socket1.disconnect();
            socket2.emit('selectChar', 'Slasher');
        });
    });
    //TODO integration tests
});