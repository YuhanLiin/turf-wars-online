var Skill = require('../skill.js');
var Projectile = require('../../hitbox.js').Projectile;

function Detonate(character, attackList, projectileList){
    var skill = Object.assign(Object.create(Detonate.prototype), Skill(character));
    skill.projectileList = projectileList;
    return skill;
}

Detonate.prototype = Object.assign(Object.create(Skill.prototype), {
    cooldown: 30*8, endFrame: 3,
    _activeProcess(){
        //Modify all current projectiles on frame 1 according to projectile id
        if (this.curFrame === 1){
            this.projectileList.forEach(function(proj){
                switch(proj.id){
                    //Grapeshot radius is tripled
                    case 'g':
                        proj.radius *= 3;
                        break;
                    //Recoil blast is doubled
                    case 'r':
                        proj.radius *= 2;
                        break;
                    //Cannon is increased
                    case 'c':
                        proj.radius = 80;
                        break;
                }
                //All projectiles stop moving and only last for 2 frames after detonation
                proj.velx = 0;
                proj.vely = 0;
                proj.endFrame = 5;
                proj.curFrame = 1;
            })
        }
    }
});

module.exports = Detonate;