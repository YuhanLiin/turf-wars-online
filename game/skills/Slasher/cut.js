var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Cut(character, attackList, projectileList){
    var skill = Object.assign(Object.create(Cut.prototype), Skill(character));
    skill.attack = Attack(20);
    attackList.push(skill.attack);
}

Cut.prototype = Object.assign(Object.create(Skill.prototype),
{
    cooldown: 10, endFrame: 8,
    _use(){
        this.character.canTurn = false;
    },
    
    _activeProcess(){
        switch(this.curFrame){
            case 2:
                this.attack.activate();               
            case 3:
            case 4:
                var px = this.character.posx + this.character.facex * 40;
                var py = this.character.posy + this.character.facey * 40; 
                this.attack.reposition(px, py);
                break;
            case 5:
                this.attack.deactivate();
        }
    },

    _end(){
        this.character.canTurn = true;
    }
});