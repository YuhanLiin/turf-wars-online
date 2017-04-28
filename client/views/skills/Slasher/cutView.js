var skillView = require('../skillView.js')

//Draw out the cut attack as long as it is active
function _update(){
    var atk = this.model.attack;
    if (atk.curFrame > 0){
        this.set({
            left: atk.posx,
            top: atk.posy,
            opacity: 1
        });
    }
    else{
        this.setOpacity(0);
    }
}

//Should probably show a sprite. Right now just shows a circle
//Origin is at center
function CutView() {
    var view = Object.assign(new fabric.Circle({
        radius: 20,
        fill: 'red',
        opacity: 0
    }), skillView);
    view._update = _update;
    return view;
}

module.exports = CutView;