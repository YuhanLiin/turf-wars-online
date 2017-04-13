var input = require('../../game/input.js')();
var assert = require('assert');

describe('InputRecord', function(){
    it('should update different input types', function(){
        input.process('u1');
        input.process('l1');
        assert.deepStrictEqual([input.vert, input.hori], [-1, -1]);
    });

    it('should update same-type inputs', function(){
        input.process('11');
        input.process('21');
        input.process('r1');
        input.process('r0');
        assert.deepStrictEqual([input.hori, input.skill], [0, 2]);
    });

    it('should not turn off input if current input doesnt match', function(){
        input.process('d1');
        input.process('u1');
        input.process('d0');
        assert.strictEqual(input.vert, -1)
    });
});