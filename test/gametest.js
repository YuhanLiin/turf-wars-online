var Game = require('../game/game.js');
var Character = require('../game/character.js');
var assert = require('assert');

var oframeTime = Game.frameTime, oroster = Game.roster, omaxFrameSkips = Game.maxFrameSkips;

describe.only('Gameobj', function () {
    //Restore original values
    afterEach(function () {
        Game.frameTime = oframeTime;
        Game.roster = oroster;
        Game.maxFrameSkips = omaxFrameSkips;
    });

    before(function () {
        Game.inject(setTimeout, () => { });
    })

    describe('framerate', function () {
        var game;
        before(function () {
            Game.roster = { 'Character': Character };
            var input = {vert:0, hori:0, skill:0};
            game = Game({ gameId: 'id', player1: 'Character', player2: 'Character' }, { 'player1': input, 'player2':input });
        });

        it('should run at the correct framerate', function (done) {
            game.start();
            setTimeout(function () {
                assert.strictEqual(game.frameCount, 3);
                done();
            }, 105)
        })
    });
})