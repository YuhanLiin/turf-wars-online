var charView = require('./characterView.js');

//How Slasher is displayed (3 circles)
function SlasherView(x, y, radius){
    var outer = new fabric.Circle({
        radius: radius,
        fill: 'red',
        originX: 'center',
        originY: 'center'
    });

    var middle = new fabric.Circle({
        radius: radius*2/3,
        fill: 'black',
        originX: 'center',
        originY: 'center'
    });

    var inner = new fabric.Circle({
        radius: radius/3,
        fill: 'red',
        originX: 'center',
        originY: 'center'
    });

    var view = Object.assign(new fabric.Group([outer, middle, inner], {
        left: x,
        top: y,
        originX: 'center',
        originY: 'center'
    }), charView);
    return view;
}

module.exports = SlasherView;