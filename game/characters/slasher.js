var Character = require('character.js');
var Cut = require('../skills/Slasher/cut.js');
var Dash = require('../skills/Slasher/dash.js');
var Dodge = require('../skills/Slasher/dodge.js');
var Vortex = require('../skills/Slasher/vortex.js');
var skillFactories = [Cut, Dash, Dodge, Vortex];

function Slasher(...args) {
    var char = Character.apply(undefined, args);
    char.setSpeed(7);
    char.skills = skillFactories.map(factory=>factory(char));
}
