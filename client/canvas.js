//Use this canvas for rest of the game and configure it with methods
var canvas = new fabric.Canvas('gameScreen', { renderOnAddRemove: false });

//Scale an object's position and size according to factors
canvas.sresize = function (object, scaleX, scaleY) {
    object.left = object.left / object.scaleX * scaleX;
    object.top = object.top / object.scaleY * scaleY;
    object.scaleX = scaleX;
    object.scaleY = scaleY;
}

//Scale an object according to canvas size then add it
//Now all entities can be assumed to be on 1000x700 canvas
canvas.sadd = function (object) {
    var scaleX = canvas.width / 1000;
    var scaleY = canvas.height / 700;
    this.sresize(object, scaleX, scaleY);
    this.add(object);
}

//Called whenever a new screen appears
canvas.srenew = function (bgc, onKey) {
    this.clear();
    this.setBackgroundColor(bgc);
    $('*').off('keydown');
    $('*').on('keydown', onKey);
}

module.exports = canvas;
