var input = require('../../game/input.js')();
var assert = require('assert');

describe('InputRecord', function(){
    it('should update different input types', function(){
        input.process('u1l131');
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [-1, -1, 3]);
    });

    it('should queue same-type inputs', function(){
        input.process('u1r111');
        input.process('d1l121');
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [-1, 1, 1]);
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [1, -1, 2]);
    });

    it('should not turn off input if current input doesnt match', function(){
        input.process('d1r141');
        input.process('u0l030');
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [1, 1, 4]);
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [1, 1, 4]);
    });

    it('should turn off input if current input matches', function () {
        input.process('u1r131');
        input.process('u0r030');
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [-1, 1, 3]);
        assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [0, 0, 0]);
    });

    it('should return undefined when inputs run out', function () {
        for (let i = 0; i < 10; i++) {
            assert.deepStrictEqual([input.vert(), input.hori(), input.skill()], [undefined, undefined, undefined]);
        }
    })
});