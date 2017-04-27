var bind = require('./bind.js');

//Change height of filter based on how much of the cooldown has passed
function update() {
    var skill = this.model;
    var ratio = skill.curCooldown / skill.cooldown;
    this.set('height', ratio*this.maxHeight);
}

//Return a filter to be placed on top of a specific icon and bound to a skill instance
function CooldownFilter(icon) {
    var filter = new fabric.Rect({
        originX: 'center',
        originY: 'bottom',
        left: icon.left,
        top: icon.top + icon.height,
        width: icon.width,
        height: 0,
        fill: 'lightblue',
        opacity: 0.7
    });
    filter.maxHeight = icon.height;
    filter.bind = bind;
    filter.update = update;
    filter.model = null;
    return filter;
}

module.exports = CooldownFilter;