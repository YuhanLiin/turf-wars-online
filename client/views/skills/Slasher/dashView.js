var skillView = require('../skillView.js')

module.exports = function(){
    return Object.assign(new fabric.Rect({fill: ''}), skillView);
}