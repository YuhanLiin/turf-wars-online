var skillView = require('../skillView.js')

function _update(){
    var skill = this.model;
    this.set({radius: skill.curFrame/skill.endFrame*20, opacity: 0.5, 
        left: skill.character.posx, top: skill.character.posy});
}

//Yellow circle that envelops Blaster as skill happens
function GrapeshotView(){
    var view = Object.assign(new fabric.Circle({
        radius: 0,
        fill: 'yellow',
        originX: 'center',
        originY: 'center'
    }), skillView);
    view._update = _update;
    return view;
}

module.exports = GrapeshotView;