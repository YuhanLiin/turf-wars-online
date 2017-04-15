var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Vortex(character, attackList, projectileList) {
    var skill = Object.assign(Object.create(Vortex.prototype), Skill(character));
    skill.attack = Attack(35);
    attackList.push(skill.attack);
    return skill;
}

Vortex.prototype = Object.assign(Object.create(Skill.prototype), {
    //15 sec cooldown, 4 sec duration
    cooldown: 30 * 15, endFrame: 30 * 4,
    _activeProcess() {
        //Hitbox and invincibility starts on frame 11
        if (this.curFrame === 11) {
            this.character.isInvincible = true;
            this.attack.activate();
        }
        //Hitbox will always be centered around user
        if (this.curFrame >= 11) {
            this.attack.reposition(this.character.posx, this.character.posy);
        }
        //Hitbox and invincibility ends on last active frame, so 10 frames of vulnerability
        if (this.curFrame === this.endFrame-10) {
            this.attack.deactivate();
            this.character.isInvincible = false;
        }
    }
});

module.exports = Vortex;