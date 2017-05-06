var Skill = require('../skill.js');
var Projectile = require('../../hitbox.js').Projectile;

function Cannon(character, attackList, projectileList) {
    var skill = Object.assign(Object.create(Cannon.prototype), Skill(character));
    skill.projectileList = projectileList;
    return skill;
}

Cannon.prototype = Object.assign(Object.create(Skill.prototype), {
    cooldown: 8*30, endFrame: 7,
    _activeProcess(){
        switch(this.curFrame){
            //Character must stand still during duration of entire move
            case 1:
                this.character.canTurn = false;
                this.character.frameSpeed = 0;
                break;
            //Fire 50-radius projectile moving at 10 framespeed
            case this.endFrame-1:
                var px = this.character.posx + 70*this.character.facex;
                var py = this.character.posy + 70*this.character.facey;
                var vx = this.character.facex * 10;
                var vy = this.character.facey * 10;
                this.character.canTurn = true;
                this.character.frameSpeed = this.character.baseSpeed;
                //Projectile id is c
                this.projectileList.push(Projectile(50, px, py, vx, vy, 32, 'c'));
                break;
        }
    }
});

module.exports = Cannon;