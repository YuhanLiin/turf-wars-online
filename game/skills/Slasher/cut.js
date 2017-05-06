var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Cut(character, attackList, projectileList){
    var skill = Object.assign(Object.create(Cut.prototype), Skill(character));
    var attackRadius = 30;
    skill.attack = Attack(attackRadius);
    attackList.push(skill.attack);
    //Distance between center of attack hitbox and center of character
    skill.centerDist = character.radius + attackRadius;
    return skill;
}

Cut.prototype = Object.assign(Object.create(Skill.prototype),
{
    cooldown: 15, endFrame: 8,
    _activeProcess(){
        switch (this.curFrame) {
            //When attack starts prevent character from turning
            case 1:
                this.character.canTurn = false;
                break;
            //On frame 5 the hitbox ends and the character can turn
            case 5:
                this.attack.deactivate();
                this.character.canTurn = true;
                break;
            //Frame 3 is first active frame
            case 3:
                this.attack.activate();
            case 4:
                //3, 4 are active frames in which the hitbox moves with the character
                var px = this.character.posx + this.character.facex * this.centerDist;
                var py = this.character.posy + this.character.facey * this.centerDist;
                this.attack.reposition(px, py);
                break;
        }
    },
});

module.exports = Cut;