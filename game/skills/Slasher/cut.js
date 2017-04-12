var Skill = require('../skill.js');

var Cut = Skill.generateSub();

Cut.prototype = Object.assign(Object.create(Skill.prototype),
{
    cooldown: 10, endFrame: 6,

});