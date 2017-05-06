var skillView = require('../skillView.js')
var Projectile = require('../../hitbox.js').Projectile;

function Grapeshot(character, attackList, projectileList) {
    var skill = Object.assign(Object.create(Grapeshot.prototype), Skill(character));
    skill.projectileList = projectileList;
}

Grapeshot.prototype = Object.assign(Object.create(skillView), {
    cooldown: 25, endFrame: 9,
    _activeProcess(){
        switch(this.curFrame){
            //Projectile direction will be determined by character direction on frame 1
            case 1:
                this.shotFacex = this.character.facex;
                this.shotFacey = this.character.facey;
                //Make character move faster during entire attack
                this.character.frameSpeed = 8;
                break;
            //Right before the last frame fire a 10-radius shot at 35 frame speed. Last 25 frames
            case this.endFrame-1:
                //Projectile starts 40 units away, so can't hit stacked
                var px = this.character.posx + 40*this.shotFacex;
                var py = this.character.posy + 40*this.shotFacey;
                var vx = this.shotFacex * 35;
                var vy = this.shotFacey * 35;
                this.character.frameSpeed = this.character.baseSpeed;
                this.projectileList.push(Projectile(10, px, py, vx, vy, 25))
                break;
        }
    }
});

module.exports = Grapeshot;