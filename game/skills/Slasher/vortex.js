var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Vortex(character, attackList, projectileList) {
    var skill = Object.assign(Object.create(Vortex.prototype), Skill(character));
    skill.attack = Attack(35);
    attackList.push(skill.attack);
    return skill;
}

Vortex.prototype = Object.assign(Object.create(Skill.prototype), {
    cooldown: 30 * 15, endFrame: 30 * 4,
    _activeProcess() {
        if (curFrame === 11) {
            this.character.isInvincible = true;
            this.attack.activate();
        }
        if (curFrame >= 11) {
            this.attack.reposition(this.character.posx, this.character.posy);
        }
        if (curFrame === endFrame) {
            this.attack.deactivate();
            this.character.isInvincible = false;
        }
    }
});