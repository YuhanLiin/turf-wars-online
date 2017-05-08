var charView = require('./characterView.js');

function BlasterView(x, y, radius){
    var outer = new fabric.Circle({
        radius: radius,
        fill: 'turquoise',
        originX: 'center',
        originY: 'center'
    });

    var square = new fabric.Rect({
        width: Math.sqrt(2)*radius,
        height: Math.sqrt(2)*radius,
        originX: 'center',
        originY: 'center',
        fill: 'lightgreen'
    });

    var inner = new fabric.Rect({
        radius: radius/10,
        fill: 'darkgreen',
        originX: 'center',
        originY: 'center'
    });

    var view = Object.assign(new fabric.Group([outer, square, inner], {
        left: x,
        top: y,
        originX: 'center',
        originY: 'center'
    }), charView);
    return view;
}

module.exports = BlasterView;