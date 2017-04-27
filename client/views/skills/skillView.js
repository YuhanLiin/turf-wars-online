var bind = require('../bind.js');

//Mixin for all skills
module.exports = {
    update(){
        var skill = this.model;
        if (skill.curFrame > 0){
            this._update();
        }
        //Automatically turn off nonactive skill views
        else this.setOpacity(0);
    },

    //Default empty skill specific update function
    _update(){},

    bind: bind;
};