var skillView = require('../skillView.js')

function _update(){
    var skill = this.model;
    var [circle, outerLining, innerLining, bar] = this.getObjects();
    //Center view onto character and make it visible
    this.set({left: skill.character.posx, top: skill.character.posy});

    //On first 10 frames have the circle expand into the size of character
    if (skill.curFrame <= 10){
        circle.setRadius(20*skill.curFrame/10);
    }
    //On last 10 frames turn off all components except the circle, which shrinks into 0
    else if (skill.curFrame >= skill.endFrame-10){
        outerLining.setOpacity(0);
        innerLining.setOpacity(0);
        bar.setOpacity(0);
        var framesLeft = skill.endFrame - skill.curFrame;
        circle.setRadius(20*framesLeft/10)
    }
    //On active frames make the gray circle larger and put 2 black rings in it
    else{
        outerLining.setOpacity(1);
        innerLining.setOpacity(1);
        bar.setOpacity(1);
        circle.setRadius(35);
        //Change orientation of the gray bar every 3 frames to make it look like spinning
        if (this._spinState <= 3) bar.set({width:20, height:60});
        else bar.set({width:60, height:20});
    }

    this._spinState++;
    if (this._spinState > 6) this._spinState = 1;
}

function VortexView (){
    var circle = new fabric.Circle({
        originX: 'center',
        originY: 'center',
        top: 0,
        left: 0,
        radius: 0,
        fill: 'gray',
    });
    var outerLining = new fabric.Circle({
        originX: 'center',
        originY: 'center',
        top: 0,
        left: 0,
        radius: 27,
        fill: '',
        stroke: 'black',
    });
    var innerLining = outerLining.clone();
    innerLining.setRadius(15);
    var bar = new fabric.Rect({
        originX: 'center',
        originY: 'center',
        top: 0,
        left: 0,
        fill: 'gray'
    });

    var view = Object.assign(new fabric.Group([circle, outerLining, innerLining, bar], {
        originY: 'center', originX: 'center',
        width: 80, height: 80
    }), skillView);
    view._spinState = 1;
    view._update = _update;
    return view;
}

module.exports = VortexView;