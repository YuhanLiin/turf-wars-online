var SlasherView = require('./characters/slasherView.js');
var CutView = require('./skills/Slasher/cutView.js');
var DodgeView = require('./skills/Slasher/dodgeView.js');
var VortexView = require('./skills/Slasher/vortexView.js');

var BlasterView = require('./characters/blasterView.js');
var GrapeshotView = require('./skills/Blaster/grapeshotView.js');
var CannonView = require('./skills/Blaster/cannonView.js');
var DetonateView = require('./skills/Blaster/detonateView.js');
var BlasterProjView = require('./projectiles/blasterProjView.js');

var EmptyView = require('./skills/emptyView.js');
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
        skillViewModel('Dash', 'Move a short distance in any of the 8 cardinal directions.', '2', EmptyView),
        skillViewModel('Dodge', 'Defensive technique that grants momentary protection and strikes enemies touching you.', '3.5', DodgeView),
        skillViewModel('Vortex', 'Speed up and slice up everything around you for the next 3 seconds.', '12', VortexView),
    ]
};

module.exports.Blaster = {
    Sprite: BlasterView,
    skills: [
        skillViewModel('Grapeshot', 'Standard projectile attack that shoots quickly.', '0.7', GrapeshotView),
        skillViewModel('Recoil Blast', 'Shoot behind yourself twice, launching forward each time.', '6', EmptyView),
        skillViewModel('Cannon', 'Charge up and fire a large projectile that travels slowly.', '8', CannonView),
        skillViewModel('Killer Queen', 'Instantly cause all of your projectiles to explode.', '10', DetonateView),
    ],
    ProjectileView: BlasterProjView
}