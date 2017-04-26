var skillView = require('../skillView.js')

function update(skill){
    if (skill.curFrame >= 1){
        this.setOpacity(1);
        var lines = this.getObjects();
        var dir = [0, 1, -1];

        var l = 0
        for (let i=0; i<3; i++){
            for (let j=0; j<3; j++){
                lines[l].x1;
            }
        }
    }
}
function DashView(){
    var lines = []
    for (let i=0; i<9; i++) lines.push(new fabric.Line());
    var view = Object.assign(new fabric.Group(lines, {
        fill: 'black',
        opacity: 0
    }), skillView);
}