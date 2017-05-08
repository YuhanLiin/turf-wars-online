var charView = require('./characterView.js');

function BlasterView(x, y, radius){
    var outer = new fabric.Circle({
        radius: radius,
        fill: 'magenta',
        originX: 'center',
        originY: 'center'
    });

    var square = new fabric.Rect({
        width: Math.sqrt(2)*radius,
        height: Math.sqrt(2)*radius,
        originX: 'center',
        originY: 'center',
        fill: 'orange'
    });

    var view = Object.assign(new fabric.Group([outer, square], {
        left: x,
        top: y,
        originX: 'center',
        originY: 'center'
    }), charView);
    return view;
}

module.exports = BlasterView;