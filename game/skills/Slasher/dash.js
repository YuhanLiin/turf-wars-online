var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Dash(character) {
    return Object.assign(Object.create(Dash.prototype), Skill(character));
}

Dash.prototype = Object.assign(Object.create(Skill.prototype), {
    cooldown: 60, endFrame: 5,
    _use() {
        this.character.canTurn = false;
    },

    _activeProcess() {
        switch (this.curFrame) {
            case 1:
                this.character.canTurn = true;
                break;
            case 2:
            case 3:
            case 4:
            case 5:
                this.character.frameSpeed = this.character.baseSpeed * 4;
                this.character.canMove = true;
                break;
            case 6:
                this.character.canTurn = false;
                this.character.frameSpeed = this.character.baseSpeed;
                break;
        }
    }
});