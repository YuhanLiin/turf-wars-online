var skillView = require('../skillView.js')
var Projectile = require('../../hitbox.js').Projectile;

function RecoilBlast(character, attackList, projectileList){
    var skill = Object.assign(Object.create(RecoilBlast.prototype), Skill(character));
    skill.projectileList = projectileList;
}

RecoilBlast.prototype = {
    cooldown: 5*30, endFrame: 15,
    _activeProcess(){
        //Increased movement every frame
        if (this.curFrame > 1){
            this.character.frameSpeed = this.character.baseSpeed * 6;
            this.character.isMoving = true;
        }
        //Cant turn on first 7 frames
        if (this.curFrame === 1){
            this.character.canTurn = false;
        }
        //One opportunity to turn available on frame 7
        else if(this.curFrame === 7){
            this.character.canTurn = true;
        }
        else if (this.curFrame === 8){
            this.character.canTurn = false;
        }
        //Restore defaults
        else if (this.curFrame === this.endFrame){
            this.character.frameSpeed = this.character.baseSpeed
            this.character.canTurn = true;
        }
    }
}

module.exports = RecoilBlast;