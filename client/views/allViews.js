var SlasherView = require('./characters/slasherView.js');
var CutView = require('./skills/Slasher/cutView.js');
var DashView = require('./skills/Slasher/dashView.js');
var DodgeView = require('./skills/Slasher/dodgeView.js');
var VortexView = require('./skills/Slasher/vortexView.js');

var IconGen = require('./skillIcon.js');

var descriptions = {
    'Cut': "Quick melee attack that hits right in front of you.",
    'Dash': "Move a short distance in any of the 8 cardinal directions.",
    'Dodge': "Evade all attacks for an instant.",
    'Vortex': "Become invinsible and slice up everything around you for the next 4 seconds."
}

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
        skillViewModel('Dash', 'Move a short distance in any of the 8 cardinal directions.', '2', DashView),
        skillViewModel('Dodge', 'Evade all attacks for an instant.', '3.5', DodgeView),
        skillViewModel('Vortex', 'Become invinsible and slice up everything around you for the next 4 seconds.', '15', VortexView),
    ]
};