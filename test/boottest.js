var boot = require('../bootstrapper.js');
var Game = require('../game/game.js');
var repo = require('../repository.js');
var assert = require('assert');

describe('serverside game bootstrapper', function(){
    var game;
    var notifs = [];
    var start;
    //Keep track of all notifs
    repo.sub.on('pmessage', function(pattern, channel, message){
        if (pattern === 'StartMatch/*' || pattern === 'Update/*') notifs.push(channel+message);
    });

    before(function(){
        start = Game.prototype.start;
        Game.prototype.start = function(){
            start.apply(this);
            game = this;
        }
    });

    after(function(){
        Game.prototype.start = start;
    });

    it('should create game and update players', function(done){
        //Create game
        boot(JSON.stringify({gameId:'example', player1:'Slasher', player2:'Slasher'}));
        //Disable input wait time just for this test so frames will actually increase
        var wait = Game.maxWaitTime;
        Game.maxWaitTime = 0;
        setTimeout(function(){
            assert(notifs.includes('StartMatch/'+'player1'+JSON.stringify({player1:'Slasher', player2:'Slasher'})), 'Send notif');
            assert(notifs.includes('StartMatch/'+'player2'+JSON.stringify({player1:'Slasher', player2:'Slasher'})), 'Send notif');
            assert(game.frameCount >= 1, 'Game should have started');
            //Restore input wait time
            Game.maxWaitTime = wait;
            done();
        }, 105);
    });

    it('should redirect inputs', function(done){
        notifs = [];
        var frames = game.frameCount;
        repo.sendInput('player1', '100');
        repo.sendInput('player2', 'nn0');
        repo.sendInput('player1', '100');
        repo.sendInput('player2', 'nn1');
        setTimeout(function(){
            //Make sure 2 frames have passed
            assert.strictEqual(game.frameCount - frames, 2)
            assert.deepStrictEqual(notifs, ['Update/player1'+'100', 'Update/player2'+'nn0',
             'Update/player1'+'100', 'Update/player2'+'nn1']);
            done();
        }, 85)
    });

    it('should not take any more inputs and stop game once it is deleted', function(done){
        var oldCount = game.frameCount;
        repo.pub.publish('Games/delete', 'example');
        notifs = [];
        repo.sendInput('player1', '100');
        repo.sendInput('player2', 'nn0');
        setTimeout(function(){
            assert.deepStrictEqual(notifs, []);
            assert.strictEqual(oldCount, game.frameCount);
            done();
        }, 40);
    });

    it('should ignore nonexistent inputs and deletes', function(){
        repo.pub.publish('Games/delete', 'nonexistent');
        return repo.sendInput('nonexistent', '1111');
    });
})