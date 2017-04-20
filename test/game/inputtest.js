var input = require('../../game/input.js')();
var assert = require('assert');

describe('InputRecord', function(){
    it('should update different input types', function(){
        input.process('nn3');
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [-1, -1, 3]);
    });

    it('should queue same-type inputs', function(){
        input.process('n11');
        input.process('1n2');
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [-1, 1, 1]);
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [1, -1, 2]);
    });

    it('should turn off input if current input matches', function () {
        input.process('n13');
        input.process('000');
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [-1, 1, 3]);
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [0, 0, 0]);
    });

    it('should return undefined when inputs run out', function () {
        for (let i = 0; i < 10; i++) {
            assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [undefined, undefined, undefined]);
        }
    });

    it('should reject invalid inputs', function () {
        input.process('n4k');
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [undefined, undefined, undefined]);
    });

    it('should numbers back into input code', function () {
        assert.strictEqual(input.pack(0, -1, 4), '0n4');
    })
});