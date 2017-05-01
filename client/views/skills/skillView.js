var bind = require('../bind.js');

//Mixin for all skills
module.exports = {
    update(){
        var skill = this.model;
        //Set opacity to full whenever skill is active
        if (skill.curFrame > 0){
            this.setOpacity(1);
            this._update();
        }
        //Automatically turn off nonactive skill views
        else this.setOpacity(0);
    },

    bind: bind,

    //If not inherited, this will do nothing
    _update(){}
};