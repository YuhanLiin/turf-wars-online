//Mixin for all skills
module.exports = {
    update(skill){
        if (skill.curFrame > 0){
            this._update(skill);
        }
        //Automatically turn off nonactive skill views
        else this.setOpacity(0);
    },

    //Default empty skill specific update function
    _update(){}
};