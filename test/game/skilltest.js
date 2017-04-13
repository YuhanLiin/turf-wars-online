var Skill = require('../../game/skills/skill.js');
var assert = require('assert');

describe('Base Skill', function () {
    var skill;
    before(function () {
        skill = Skill({ canAct: true });
        skill._use = () => { };
        skill._activeProcess = () => { };
        skill.cooldown = 2;
        skill.endFrame = 1;
    });

    beforeEach(function () {
        skill.character.canAct = true;
        skill.curFrame = 0;
        skill.curCooldown = 0;
    });

    it('should only activate when off cooldown and character can act', function () {
        assert(skill.use());
        assert(!skill.use());
        assert.strictEqual(skill.curCooldown, 2);
        skill.curCooldown = 0;
        assert(!skill.use());
    });

    it('should be active for correct # of frames', function () {
        skill.use();
        skill.activeProcess();
        assert.deepStrictEqual([skill.curFrame, skill.character.canAct], [0, true]);
    });

    it('should lower cooldown', function () {
        skill.use();
        skill.frameProcess();
        skill.frameProcess();
        assert.deepStrictEqual([skill.curFrame, skill.character.canAct, skill.curCooldown], [0, true, 0]);
    });
});

describe('generateSub()', function () {
    it('should generate subclass factory', function () {
        var Sub = Skill.generateSub();
        Sub.prototype = Skill.prototype;
        var sub = Sub({ canAct: true });
        sub._use = () => { };
        assert(sub.use());
        assert(!sub.use());
    })
})