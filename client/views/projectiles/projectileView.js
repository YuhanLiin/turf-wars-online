var bind = require('../bind.js');

module.exports = {
    bind: bind,
    //Positions and radius are set automatically
    update(){
        this.set({top: this.model.posy, left: this.model.posx, radius: this.model.radius});
        this._update();
    },
    _update(){},
    //For determining whether to remove the projectile view
    isDone(){
        return this.model.isDone();
    }
};