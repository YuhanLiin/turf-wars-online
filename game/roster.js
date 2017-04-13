var Cut = require('./skills/Slasher/cut.js');
var Dash = require('./skills/Slasher/dash.js');
var Dodge = require('./skills/Slasher/dodge.js');
var Vortex = require('./skills/Slasher/vortex.js');
var Slasher = require('./characters/slasher.js');

var roster = {
    'Slasher': {
        'character': Slasher,
        'skills': [Cut, Dash, Dodge, Vortex]
    }
}

module.exports = roster;