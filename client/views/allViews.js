var SlasherView = require('./characters/slasherView.js');
var CutView = require('./skills/Slasher/cutView.js');
var DodgeView = require('./skills/Slasher/dodgeView.js');
var VortexView = require('./skills/Slasher/vortexView.js');

var emptyView = require('./skills/emptyView.js');
var IconGen = require('./skillIcon.js');

function skillViewModel(name, description, cooldown, skillView){
    return {
        name: name,
        description: description,
        cooldown: cooldown,
        Icon: IconGen(name),
        Sprite: skillView
    };
}

module.exports.Slasher = {
    Sprite: SlasherView,
    skills: [
        skillViewModel('Cut', 'Quick melee attack that hits right in front of you.', '0.5', CutView),
        skillViewModel('Dash', 'Move a short distance in any of the 8 cardinal directions.', '2', emptyView),
        skillViewModel('Dodge', 'Defensive technique that grants momentary protection and strikes enemies touching you.', '3.5', DodgeView),
        skillViewModel('Vortex', 'Speed up and slice up everything around you for the next 3 seconds.', '12', VortexView),
    ]
};