var bind = require('../bind.js');

module.exports = {
    bind: bind,
    update(){
        this.setLeft(this.model.posx);
        this.setTop(this.model.posy);
    }
}