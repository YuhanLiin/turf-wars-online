var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Dodge(character) {
    return Object.assign(Object.create(Dodge.prototype), Skill(character));
}

Dodge.prototype = Object.assign(Object.create(Skill.prototype), {
    cooldown: 30*3.5, endFrame: 6,
    _activeProcess() {
        switch (this.curFrame) {
            //Invincible for first 5 frames, vulnerable last frame
            case 1:
                this.character.isInvincible = true;
                break;
            case this.endFrame:
                this.character.isInvincible = false;
                break;
        }
    }
});

module.exports = Dodge;