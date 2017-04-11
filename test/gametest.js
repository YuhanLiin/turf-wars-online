var Game = require('../game/game.js');
var Character = require('../game/character.js');
var assert = require('assert');

var oframeTime = Game.frameTime, oroster = Game.roster, omaxFrameSkips = Game.maxFrameSkips;
describe('Gameobj', function () {
    //Restore original values
    afterEach(function () {
        Game.frameTime = oframeTime;
        //Game.roster = oroster;
        Game.maxFrameSkips = omaxFrameSkips;
    });

    before(function () {
        Game.inject(setTimeout, () => { });
    })

    describe('frame ticks', function () {
        var input = { vert: 0, hori: 0, skill: 0 };
        before(function () {
            Game.roster = { 'Character': Character };
        });

        it('should run at the correct framerate', function (done) {
            var game = Game({ gameId: 'id', player1: 'Character', player2: 'Character' }, { 'player1': input, 'player2': input });
            game.start();
            setTimeout(function () {
                assert.strictEqual(game.frameCount, 3);
                done();
            }, 105)
        });

        it('should handle load', function (done) {
            var games = [];
            for (let i = 0; i < 5; i++) {
                games.push(Game({ gameId: 'id', player1: 'Character', player2: 'Character' }, { 'player1': input, 'player2': input }));
                games[i].start();
            }
            setTimeout(function () {
                assert.deepStrictEqual(games.map(game=>game.frameCount), games.map(()=>30));
                done();
            }, 1005)
        })
    });
})