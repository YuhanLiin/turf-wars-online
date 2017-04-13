var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Cut(character, attackList, projectileList){
    var skill = Object.assign(Object.create(Cut.prototype), Skill(character));
    var attackRadius = 20;
    skill.attack = Attack(attackRadius);
    attackList.push(skill.attack);
    //Distance between center of attack hitbox and center of character
    skill.centerDist = character.radius + attackRadius;
}

Cut.prototype = Object.assign(Object.create(Skill.prototype),
{
    cooldown: 15, endFrame: 8,  
    _activeProcess(){
        switch (this.curFrame) {
            case 1:
                this.character.canTurn = false;
                break;
            case 3:
                this.attack.activate();               
            case 4:
            case 5:
                var px = this.character.posx + this.character.facex * this.centerDist;
                var py = this.character.posy + this.character.facey * this.centerDist;
                this.attack.reposition(px, py);
                break;
            case 6:
                this.attack.deactivate();
                break;
            case endFrame:
                this.character.canTurn = true;
                break;
        }
    },

    _end(){
        this.character.canTurn = true;
    }
});