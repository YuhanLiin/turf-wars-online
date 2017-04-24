var charView = require('./charView.js');
var IconGen = require('./skillIcon.js');

module.exports.Slasher = {
    Sprite: charView.SlasherView,
    skills: ['Cut', 'Dash', 'Dodge', 'Vortex'].map(function (name) {
        return {
            name: name,
            description: "placeholder",
            Icon: IconGen('Slasher', name)
        };
    })
};