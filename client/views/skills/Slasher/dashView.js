var skillView = require('../skillView.js')

function _update(){
    var skill = this.model;
    this.setOpacity(1);
    var lines = this.getObjects();
    var dir = [0, 1, -1];

    var l = 0
    for (let i=0; i<3; i++){
        for (let j=0; j<3; j++){
            lines[l].x1 = dir[i] * skill.character.radius * skill.character.facex;
            lines[l].y1 = dir[j] * skill.character.radius * skill.character.facey;
            l++;
        }
    }

    lines.forEach(function(line){
        line.x2 = line.x1 - 80*skill.character.facex;
        line.y2 = line.y1 - 80*skill.character.facey;
    });
}

//Needs to be rendered before characters
function DashView(){
    //Put 9 lines into the group
    var lines = []
    for (let i=0; i<9; i++) 
        lines.push(new fabric.Line({fill: 'black'}));
    var view = Object.assign(new fabric.Group(lines, {
        fill: 'black',
        opacity: 0
    }), skillView);
    view._update = _update;
    return view;
}

module.exports = DashView;