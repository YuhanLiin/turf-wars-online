
function Skill(character){
    var skill = Object.create(Skill.prototype);
    //Frame 0 means skill is inactive
    skill.curFrame = 0;
    skill.curCooldown = 0;
    //Skill references its user to change properties
    skill.character = character;
}

//Creates subclass factory, since the instance variables are same for all subclasses
Skill.generateSub = function(){
    function sub (character){
        return Object.assign(Object.create(sub.prototype), Skill(character));
    }
    return sub;
}

Skill.prototype = {
    //Uses a skill if its cooldown has passed. Returns whether skill was actually used
    use(){
        if (this.curCooldown === 0 && this.character.canAct){
            //Active skills start on frame 1
            this.curFrame = 1;
            this.curCooldown = this.cooldown;
            //Custom activation code
            this._use();
            return true;
        }
        return false;
    },

    activeProcess(){
        this.character.canAct = false;
        //Custom skill code
        this._activeProcess(character);
        //When skill is done, character can act and skill becomes inactive
        if (this.curFrame > this.endFrame){
            this.curFrame = 0;
            this.character.canAct = true;
            return;
        }
        this.curFrame++;
    },

    //Adheres to frameProcess interface
    frameProcess(){
        //If skill is active, active process
        if (this.curFrame > 0){
            this.activeProcess(this.character);
        }
        //Lower cooldown every frame
        if (this.curCooldown > 0){
            this.curCooldown--;
        }
    }
};
//Excluded cooldown, endFrame, _use, _activeProcess

module.exports = Skill;