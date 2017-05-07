var skillView = require('./skillView.js')

//View that doesnt show up. Essentially for skills without cosmetic effects
module.exports = function(){
    return Object.assign(new fabric.Rect({fill: ''}), skillView);
}