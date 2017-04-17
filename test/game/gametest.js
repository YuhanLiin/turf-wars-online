var Game = require('../../game/game.js');
var Character = require('../../game/characters/character.js');
var assert = require('assert');

describe('Gameobj', function () {
    //Restore original values
    var endUpdates = [];
    before(function () {
        Game.inject(setTimeout, function(topic, message){
            endUpdates.push(topic+message);
        });
    })

    describe('frame ticks', function () {
        it('should run at the correct framerate', function (done) {
            var game = Game({player1: 'Slasher', player2: 'Slasher' });
            game.start();
            setTimeout(function () {
                assert.strictEqual(game.frameCount, 3);
                done();
            }, 105)
        });

        it('should handle load', function (done) {
            var games = [];
            for (let i = 0; i < 5; i++) {
                games.push(Game({ player1: 'Slasher', player2: 'Slasher' }));
                games[i].start();
            }
            setTimeout(function () {
                assert.deepStrictEqual(games.map(game=>game.frameCount), games.map(()=>30));
                done();
            }, 1005)
        });
    });

    describe('Simple simulation', function(){
        var game;
        beforeEach('Moving characters near each other', function(){
            game = Game({player1: 'Slasher', player2: 'Slasher' });
            endUpdates = [];
            //Move them together horizontally
            game.inputs['player2'].hori = 1;
            game.inputs['player2'].vert = 0;
            game.inputs['player1'].hori = -1;
            game.inputs['player1'].vert = 0;
            for (let i=0; i<Math.round(360/7); i++){
                game.frame();
            }
            assert.deepStrictEqual(endUpdates, []);
            //Move them together vertically
            game.inputs['player2'].hori = 0;
            game.inputs['player2'].vert = 1;
            game.inputs['player1'].hori = 0;
            game.inputs['player1'].vert = -1;
            for (let i=0; i<Math.round(310/7); i++){
                game.frame();
            }
            assert.deepStrictEqual(endUpdates, []);
            //Stop moving
            game.inputs['player2'].hori = 0;
            game.inputs['player2'].vert = 0;
            game.inputs['player1'].hori = 0;
            game.inputs['player1'].vert = 0;
        });

        it('should end game with winner when a character dies', function(){
            game.inputs['player1'].skill = 1;
            for (let i=0; i<4; i++) game.frame();
            assert(game.isDone, 'should be done');
            assert(endUpdates.includes('Win'+'player1'), 'player1 should win');
        });

        it('should end game with draw if both players die', function(){
            game.inputs['player1'].skill = 1;
            game.inputs['player2'].skill = 1;
            for (let i=0; i<4; i++) game.frame();
            assert(game.isDone, 'should be done');
            assert(endUpdates.includes('Draw'+'player1') || endUpdates.includes('Draw'+'player2'), 'should draw');
        });
    })
})