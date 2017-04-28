var skillView = require('../skillView.js')

function _update(){
    var skill = this.model;
    this.set({left: skill.character.posx, top: skill.character.posy});
    //Have it blink once every 2 frames
    if (skill.curFrame/2 % 2 != 0){
        this.setOpacity(0.5);
    }
    else{
        this.setOpacity(0);
    }
}

//An overlay for the character, origin in center
function DodgeView(){
    var view = Object.assign(new fabric.Circle({
        radius: 20,
        color: 'white'
    }), skillView);
    view._update = _update;
    return view;
}

module.exports = DodgeView;