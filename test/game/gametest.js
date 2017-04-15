var Game = require('../../game/game.js');
var Character = require('../../game/characters/character.js');
var assert = require('assert');

describe.only('Gameobj', function () {
    //Restore original values
    before(function () {
        Game.inject(setTimeout, () => { });
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
        })
    });
})