var Skill = require('../skill.js');
var Projectile = require('../../hitbox.js').Projectile;

function RecoilBlast(character, attackList, projectileList){
    var skill = Object.assign(Object.create(RecoilBlast.prototype), Skill(character));
    skill.projectileList = projectileList;
    return skill;
}

RecoilBlast.prototype = Object.assign(Object.create(Skill.prototype), {
    cooldown: 5*30, endFrame: 15,
    //Helper method for creating and adding projectile behind character, opposite where it's facing
    _fireShot(){
        var px = this.character.posx - 40*this.character.facex;
        var py = this.character.posy - 40*this.character.facey;
        var vx = this.character.facex * -25;
        var vy = this.character.facey * -25;
        //Projectile id is r
        this.projectileList.push(Projectile(18, px, py, vx, vy, 40, 'r'))
    },
    _activeProcess(){
        //Increased movement every frame
        if (this.curFrame > 1){
            this.character.frameSpeed = this.character.baseSpeed * 6;
            this.character.isMoving = true;
        }
        //Cant turn on first 7 frames. Fire a shot
        if (this.curFrame === 1){
            this.character.canTurn = false;
            this._fireShot();
        }
        //One opportunity to turn available on frame 7
        else if(this.curFrame === 7){
            this.character.canTurn = true;
        }
        //Fire second shot after turning
        else if (this.curFrame === 8){
            this.character.canTurn = false;
            this._fireShot();
        }
        //Restore defaults
        else if (this.curFrame === this.endFrame){
            this.character.frameSpeed = this.character.baseSpeed
            this.character.canTurn = true;
        }
    }
});

module.exports = RecoilBlast;