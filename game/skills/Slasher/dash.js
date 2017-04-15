var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Dash(character) {
    return Object.assign(Object.create(Dash.prototype), Skill(character));
}

Dash.prototype = Object.assign(Object.create(Skill.prototype), {
    cooldown: 60, endFrame: 5,
    _activeProcess() {
        switch (this.curFrame) {
            //Cant turn during dash
            case 1:
                this.character.canTurn = false;
                break;
            //Dash lasts for 3 frames
            case 2:
            case 3:
            case 4:
                this.character.frameSpeed = this.character.baseSpeed * 4;
                this.character.canMove = true;
                break;
            case this.endFrame:
                this.character.canTurn = true;
                this.character.frameSpeed = this.character.baseSpeed;
                break;
        }
    }
});

module.exports = Dash;