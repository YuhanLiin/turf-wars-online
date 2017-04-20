var Game = require('../../game/game.js');
var Input = require('../../game/input.js');
var Character = require('../../game/characters/character.js');
var assert = require('assert');

describe.only('Gameobj', function () {
    //Restore original values
    var endUpdates = [];
    var updates = [];
    before(function () {
        Game.inject(setTimeout, function (topic='', player='', message='') {
            if (topic === 'update') updates.push(topic+player+message)
            else endUpdates.push(topic+player+message);
        });
    })

    describe('frame ticks', function () {
        it('should run at the correct framerate', function (done) {
            var game = Game({ player1: 'Slasher', player2: 'Slasher' }, { player1: Input(), player2: Input() });
            game.start();
            setTimeout(function () {
                assert.strictEqual(game.frameCount, 3);
                done();
            }, 105)
        });

        it('should handle load', function (done) {
            var games = [];
            for (let i = 0; i < 5; i++) {
                games.push(Game({ player1: 'Slasher', player2: 'Slasher' }, { player1: Input(), player2: Input() }));
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
            game = Game({ player1: 'Slasher', player2: 'Slasher' }, { player1: Input(), player2: Input() });
            endUpdates = [];
            //Move them together horizontally
            for (let i = 0; i < Math.round(360 / 7) ; i++) {
                game.inputs.player2.process('010');
                game.inputs.player1.process('0n0');
                game.frame();
            }
            assert.deepStrictEqual(endUpdates, []);
            //Move them together vertically
            for (let i = 0; i < Math.round(310 / 7) ; i++) {
                game.inputs.player2.process('100');
                game.inputs.player1.process('n00');
                game.frame();
            }
            assert.deepStrictEqual(endUpdates, []);
        });

        it('should end game with winner when a character dies', function () {
            game.inputs.player1.process('001');
            game.inputs.player2.process('000');
            for (let i = 0; i < 4; i++) game.frame();
            assert(game.isDone, 'should be done');
            assert(endUpdates.includes('win'+'player1', 'player1 should win'));
            assert(endUpdates.includes('lose'+'player2', 'player2 should lose'));
        });

        it('should end game with draw if both players die', function () {
            game.inputs.player1.process('001');
            game.inputs.player2.process('001');
            for (let i=0; i<4; i++) game.frame();
            assert(game.isDone, 'should be done');
            assert(endUpdates.includes('draw'+'player1', 'player1 should draw'));
            assert(endUpdates.includes('draw'+'player2', 'player2 should draw'));
        });
    })
})