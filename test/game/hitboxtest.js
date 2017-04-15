var hb = require('../../game/hitbox.js');
var assert = require('assert')
var Attack = hb.Attack;
var Projectile = hb.Projectile;

function generateHitTest(type) {
    return function () {
        var box = type(20);
        box.posx = 40;
        box.posy = 40;
        var target1 = { posx: 70, posy: 20, radius: 10, isAlive:true };
        var target2 = { posx: 40, posy: 90, radius: 30, isAlive:true };
        box.checkHit(target1);
        box.checkHit(target2);
        assert(target1.isAlive && target2.isAlive, "False positive");

        target1 = { posx: 60, posy: 20, radius: 21, isAlive: true };
        target2 = { posx: 40, posy: 50, radius: 30, isAlive: true };
        box.checkHit(target1);
        box.checkHit(target2);
        assert(!target1.isAlive && !target2.isAlive, "False negative");

        target1.isInvincible = true;
        target1.isAlive = true;
        box.checkHit(target1);
        assert(target1.isAlive, "Target is invincible");
    }
}

describe('Hitboxes', function () {
    it('should work for Attacks', generateHitTest(Attack));
    it('should work for Projectiles', generateHitTest(Projectile));
    describe('Attack', function () {
        it('should reposition and advance frames', function () {
            var atk = Attack(20);
            atk.activate(10, 5);
            atk.reposition(44, 6);
            assert.deepEqual([atk.posx, atk.posy, atk.curFrame], [44, 6, 2]);
            atk.deactivate();
            atk.reposition(55, 5);
            assert.equal(atk.curFrame, 0);
        });
    });

    describe('Projectile', function () {
        it('should move and advance frames', function () {
            var proj = Projectile(20, 6, 7, -5, 0, 3);
            assert(!proj.isDone());
            proj.move();
            assert.deepEqual([proj.posx, proj.posy, proj.curFrame, proj.endFrame], [1, 7, 2, 3]);
        });
    });
})