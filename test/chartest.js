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
        char.facex = 0;
        char.move();
        assert.deepEqual([char.posx, char.posy], [40, 46]);
        char.facex = -1;
        char.facey = 0;
        char.move();
        char.move();
        assert.deepEqual([char.posx, char.posy], [28, 46]);
        char.facex = 2;
        char.facey = 2;
        for (let i=0; i<3; i++) char.move();
        assert.deepEqual([char.posx, char.posy], [64, 82]);
    });

    it('should not move past world boundaries', function(){
        char.isMoving = true;
        var facings = [[0,1], [0,-1], [1,0], [-1,0]];
        var limits = [[40, 680], [40, 20], [780, 20], [20, 20]];
        for (let i=0; i<4; i++){
            char.facex = facings[i][0];
            char.facey = facings[i][1];
            for (let j=0; j<500; j++){
                char.move();
            }
            assert.deepEqual([char.posx, char.posy], limits[i]);
        }
    })
})