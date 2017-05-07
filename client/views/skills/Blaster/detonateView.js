var skillView = require('../skillView.js')

function _update(){
    var char = this.model.character;
    this.set({left: char.posx, top: char.posy, opacity: 0.6})
}

function DetonateView(){
    var view = Object.assign(new fabric.Circle({
        radius: 20,
        fill: 'red',
        originX: 'center',
        originY: 'center'
    }), skillView);
    view._update = _update;
    return view;
}

module.exports = DetonateView;