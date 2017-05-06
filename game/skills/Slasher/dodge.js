var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Dodge(character, attackList, projectileList) {
    var skill = Object.assign(Object.create(Dodge.prototype), Skill(character));
    //The hitbox will cover entire character
    skill.attack = Attack(character.radius);
    attackList.push(skill.attack);
    return skill;
}

Dodge.prototype = Object.assign(Object.create(Skill.prototype), {
    cooldown: 30*3.5, endFrame: 12,
    _activeProcess() {
        switch (this.curFrame) {
            //Invincible for first 11 frames, vulnerable last frame. Hitbox covers character the whole time
            case 1:
                this.character.isInvincible = true;
                this.attack.activate();
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
            case 11:
                this.attack.reposition(this.character.posx, this.character.posy);
                break;
            case this.endFrame:
                this.character.isInvincible = false;
                this.attack.deactivate();
                break;
        }
    }
});

module.exports = Dodge;