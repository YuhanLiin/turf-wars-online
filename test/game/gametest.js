var Game = require('../../game/game.js');
var Input = require('../../game/input.js');
var Character = require('../../game/characters/character.js');
var assert = require('assert');

describe('Gameobj', function () {
    //Have all of the game's updates redirected to a collection
    var endUpdates = [];
    var updates = {};
    var original;
    before(function(){
        original = Game.prototype;
        Game.inject(setTimeout, function (topic, player, message='') {
            if (topic === 'update'){
                if (!updates[player]){
                    updates[player] = [];
                }
                updates[player].push(topic+message);
            } 
            else endUpdates.push(topic+player+message);
        });
    });

    after(function(){
        Game.prototype = original;
    })

    describe('frame ticks', function () {
        var input1, input2;
        before(function(){
            input1 = Input(), input2 = Input();
            for (let i=0; i<5; i++){
                input1.process('000');
                input2.process('111');
            }
        });

        it('should run at the correct framerate', function (done) {
            var game = Game({ player1: 'Slasher', player2: 'Slasher' }, { player1: input1, player2: input2 });
            game.start();
            setTimeout(function () {
                assert.strictEqual(game.frameCount, 3);
                game.isDone = true;
                done();
            }, 105);
        });

        it('should stream inputs as updates', function(){
            assert.deepStrictEqual(updates.player1, ['update'+'000', 'update'+'000', 'update'+'000']);
            assert.deepStrictEqual(updates.player2, ['update'+'111', 'update'+'111', 'update'+'111']);
        });

        it('should handle load', function (done) {
            var games = [];
            var inputs1 = [];
            var inputs2 = [];
            for (let i = 0; i < 5; i++) {
                let input1 = Input(), input2 = Input();
                for (let i=0; i<20; i++){
                    input1.process('000');
                    input2.process('111');
                }
                inputs1.push(input1);
                inputs2.push(input2);
            }
            for (let i = 0; i < 5; i++) {
                games.push(Game({ player1: 'Slasher', player2: 'Slasher' }, { player1: inputs1[i], player2: inputs2[i] }));
                games[i].start();
            }
            setTimeout(function () {
                assert.deepStrictEqual(games.map(game=>game.frameCount), games.map(()=>15));
                games.forEach(game=>game.isDone = true);
                done();
            }, 505);
        });

        it('should not continue running after game is done', function(done){
            var game = Game({ player1: 'Slasher', player2: 'Slasher' }, { player1: input1, player2: input2 });
            game.start;
            game.isDone = true;
            setTimeout(function(){
                assert.strictEqual(game.frameCount, 0);
                done();
            }, 70)
        })
    });

    describe('lag compensation', function(){
        it('should not update when inputs are delayed', function(done){
            var input1 = Input(), input2 = Input();
            input1.process('000');
            var game = Game({ player1: 'Slasher', player2: 'Slasher' }, { player1: input1, player2: input2 });
            game.start()
            setTimeout(function(){
                //Only 1 input available for 1 player, so no frames are run
                assert.strictEqual(game.frameCount, 0);
                for (let i=0; i<5; i++){
                    input1.process('000');
                    input2.process('111');
                }
                setTimeout(function(){
                    //Once extra inputs are available the frameCount should go back to normal
                    assert.strictEqual(game.frameCount, 3);
                    game.isDone = true;
                    done();
                },10)
            }, 95);
        });

        it('should continue normal processing when input delay limit is reached', function(){
            var input1 = Input(), input2 = Input();
            var game = Game({ player1: 'Slasher', player2: 'Slasher' }, { player1: input1, player2: input2 });
            game.start()
            setTimeout(function(){
                assert.strictEqual(game.frameCount, 1);
                game.isDone = true;
                done();
            }, Game.maxWaitTime+35)
        });
    });

    describe('Simple simulation', function(){
        var game;
        beforeEach('Moving characters near each other', function(){
            game = Game({ player1: 'Slasher', player2: 'Slasher' }, { player1: Input(), player2: Input() });
            endUpdates = [];
            //Move them together horizontally
            for (let i = 0; i < Math.round(300 / 7) ; i++) {
                game.inputs.player2.process('010');
                game.inputs.player1.process('0n0');
                game.frame();
            }
            
            assert.deepStrictEqual(endUpdates, []);
            //Move them together vertically
            for (let i = 0; i < Math.round(360 / 7) ; i++) {
                game.inputs.player2.process('100');
                game.inputs.player1.process('n00');
                game.frame();
            }
            assert.deepStrictEqual(endUpdates, []);
        });

        it('should end game with winner when a character dies', function () {
            for (let i = 0; i < 4; i++){
                game.inputs.player1.process('001');
                game.inputs.player2.process('000');
                game.frame();
            }
            assert(game.isDone, 'should be done');
            assert(endUpdates.includes('win'+'player1', 'player1 should win'));
            assert(endUpdates.includes('lose'+'player2', 'player2 should lose'));
        });

        it('should end game with draw if both players die', function () {
            for (let i = 0; i < 4; i++){
                game.inputs.player1.process('001');
                game.inputs.player2.process('001');
                game.frame();
            }
            assert(game.isDone, 'should be done');
            assert(endUpdates.includes('draw'+'player1', 'player1 should draw'));
            assert(endUpdates.includes('draw'+'player2', 'player2 should draw'));
        });
    })
})