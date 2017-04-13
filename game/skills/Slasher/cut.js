var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Cut(character, attackList, projectileList){
    var skill = Object.assign(Object.create(Cut.prototype), Skill(character));
    var attackRadius = 20;
    skill.attack = Attack(attackRadius);
    attackList.push(skill.attack);
    //Distance between center of attack hitbox and center of character
    skill.centerDist = character.radius + attackRadius;
    return skill;
}

Cut.prototype = Object.assign(Object.create(Skill.prototype),
{
    cooldown: 15, endFrame:10,  
    _activeProcess(){
        switch (this.curFrame) {
            case 1:
                this.character.canTurn = false;
                break;
            case 2:
                this.attack.activate();               
            case 3:
            case 4:
                var px = this.character.posx + this.character.facex * this.centerDist;
                var py = this.character.posy + this.character.facey * this.centerDist;
                this.attack.reposition(px, py);
                break;
            case 5:
                this.attack.deactivate();
                this.character.canTurn = true;
                break;
        }
    },

    _end(){
        this.character.canTurn = true;
    }
});