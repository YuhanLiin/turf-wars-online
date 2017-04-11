var gamemock = {width: 800, height:700};
var Character = require('../game/character.js');
var assert = require('assert');

describe('Base Character', function(){
    var char;
    beforeEach(function(){
        char = Character(gamemock, 40, 40, 1, 1);
        char.frameSpeed = 6;
    });

    it('should not move when after initialization', function(){
        for (let i=0; i<10; i++){
            char.move();
        }
        assert.deepStrictEqual([char.posx, char.posy], [40, 40]);
    })

    it('should go straight', function(){
        char.isMoving = true;
        char.turn(0, 1);
        char.move();
        assert.deepEqual([char.posx, char.posy], [40, 46]);
        char.turn(-1, 0);
        char.move();
        char.move();
        assert.deepEqual([char.posx, char.posy], [28, 46]);
        char.facex = 2;
        char.facey = 2;
        for (let i=0; i<3; i++) char.move();
        assert.deepEqual([char.posx, char.posy], [64, 82]);
    });

    it('should not move past world boundaries', function () {
        char.isMoving = true;
        var facings = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        var limits = [[40, 680], [40, 20], [780, 20], [20, 20]];
        for (let i = 0; i < 4; i++) {
            char.turn(facings[i][0], facings[i][1]);
            for (let j = 0; j < 500; j++) {
                char.move();
            }
            assert.deepEqual([char.posx, char.posy], limits[i]);
        }
    });

    it('should move diagonally', function () {
        char.isMoving = true;
        var facings = [[1, -1], [-1, -1], [1, 1], [-1, 1]];
        var distances = [[6, -6], [-6, -6], [6, 6], [-6, 6]].map(function (pos) {
            return [pos[0] / Math.sqrt(2), pos[1] / Math.sqrt(2)];
        });
        for (let i = 0; i < 4; i++) {
            char.posx = 40, char.posy = 40;
            var dist = distances[i];
            char.turn(facings[i][0], facings[i][1]);
            char.move();
            assert.deepEqual([char.posx, char.posy], [40 + dist[0], 40 + dist[1]].map(x=>Math.round(x)));
        }
    })
})