var SlasherView = require('./characters/slasherView.js');
var IconGen = require('./skillIcon.js');

var descriptions = {
    'Cut': "Quick melee attack that hits right in front of you.",
    'Dash': "Move a short distance in any of the 8 cardinal directions.",
    'Dodge': "Evade all attacks for an instant.",
    'Vortex': "Become invinsible and slice up everything around you for the next 4 seconds."
}

function skillViewModel(name, description, cooldown){
    return {
        name: name,
        description: description,
        cooldown: cooldown,
        Icon: IconGen(name)
    };
}

module.exports.Slasher = {
    Sprite: SlasherView,
    skills: [
        skillViewModel('Cut', 'Quick melee attack that hits right in front of you.', '0.5'),
        skillViewModel('Dash', 'Move a short distance in any of the 8 cardinal directions.', '2'),
        skillViewModel('Dodge', 'Evade all attacks for an instant.', '3.5'),
        skillViewModel('Vortex', 'Become invinsible and slice up everything around you for the next 4 seconds.', '15'),
    ]
};