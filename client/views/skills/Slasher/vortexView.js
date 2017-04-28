var skillView = require('../skillView.js')

function _update(){
    var skill = this.model;
    var [circle, outerLining, innerLining, bar] = this.getObjects();
    this.set({left: skill.character.posx, right: skill.character.posy});
    circle.setOpacity(1);

    if (skill.curFrame <= 10){
        circle.setRadius(20*skill.curFrame/10);
    }
    else if (skill.curFrame >= skill.endFrame-10){
        outerLining.setOpacity(0);
        innerLining.setOpacity(0);
        bar.setOpacity(0);
        var framesLeft = skill.endFrame - skill.curFrame;
        circle.setRadius(20*framesLeft/10)
    }
    else{
        outerLining.setOpacity(1);
        innerLining.setOpacity(1);
        bar.setOpacity(1);
        circle.setRadius(35);
        if (this._spinState <= 3) bar.set({width:10, height:60});
        else bar.set({width:60, height:10});
    }

    this._spinState++;
    if (this._spinState > 6) this._spinState = 1;
}

function VortexView (){
    var circle = new fabric.Circle({
        radius: 0,
        fill: 'gray',
    });
    var outerLining = new fabric.Circle({
        radius: 27,
        fill: '',
        stroke: 'black',
    });
    var innerLining = outerLining.clone();
    innerLining.setRadius(15);
    var bar = new fabric.Rect({
        originX: 'center',
        originY: 'center',
        fill: 'gray'
    });

    var view = Object.assign(new fabric.Group([circle, outerLining, innerLining, bar], {
        originY: 'center', originX: 'center'
    }), skillView);
    view._spinState = 1;
    view._update = _update;
    return view;
}

module.exports = VortexView;