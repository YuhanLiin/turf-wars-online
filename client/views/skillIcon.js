var bind = require('./bind.js');

//Change height of filter based on how much of the cooldown has passed
function update() {
    var skill = this.model;
    var ratio = skill.curCooldown / skill.cooldown;
    this.filter.set('height', ratio*this.height);
}

function skillIconGenerator(skillName) {
    return function (x, y, length) {
        var border = new fabric.Rect({
            originX: 'center',
            originY: 'center',
            fill: 'orange',
            width: length * 6 / 5,
            height: length * 6 /5
        })
        //Icon background
        var icon = new fabric.Rect({
            originX: 'center',
            originY: 'center',
            fill: 'gray',
            //stroke: 'orange',
            width: length,
            height: length,
            //strokeWidth: length/10
        });

        //First letter of skill name in center of icon
        var letter = new fabric.Text(skillName[0], {
            originX: 'center',
            originY: 'center',
            fill: 'black',
            fontFamily: 'serif',
            fontSize: 50
        })

        //Filter for cooldowns. Begins at 0 height
        var filter = new fabric.Rect({
            originX: 'center',
            originY: 'bottom',
            top: length/2,
            width: length,
            height: 0,
            fill: 'lightblue',
            opacity: 0.7
        });

        var group = new fabric.Group([border, icon, letter, filter], {
            left: x,
            top: y,
            width: length,
            height: length
        });
        group.filter = filter;
        group.bind = bind;
        group.update = update;
        group.model = null;
        return group;
    }
}

module.exports = skillIconGenerator;
