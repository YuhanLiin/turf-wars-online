var skillView = require('../skillView.js')

function _update(){
    var skill = this.model;
    var char = skill.character;
    if (skill.curFrame < skill.endFrame){
        this.set({left: char.posx + 70*char.facex, top: char.posy + 70*char.facey, 
            radius: skill.curFrame/skill.endFrame*70});
    }
}

function CannonView(){
    var view = Object.assign(new fabric.Circle({
        radius: 0,
        fill: 'black',
        originX: 'center',
        originY: 'center'
    }), skillView);
    view._update = _update;
    return view;
}

module.exports = CannonView;