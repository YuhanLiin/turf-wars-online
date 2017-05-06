var Character = require('./character.js');
var Grapeshot = require('../skills/Blaster/grapeshot.js');
var RecoilBlast = require('../skills/Blaster/recoilBlast.js');
var Cannon = require('../skills/Blaster/cannon.js');
var Detonate = require('../skills/Blaster/detonate.js');
var skillFactories = [Grapeshot, RecoilBlast, Cannon, Detonate];

function Blaster(...args){
    var char = Character.apply(undefined, args);
    //Moves slower
    char._setProp(5, skillFactories);
    char.name = 'Blaster';
    return char;
}

module.exports = Blaster;