var selectScreen = require('./selectScreen/selectScreen.js');

var socket = io('/room',  {transports: ['websocket'], upgrade: false});
socket.emit('roomId', roomId);
//Change issue handling later
socket.on('issue', function (issue) {
    console.log(issue);
});
socket.on('startGame', function () {
    console.log('startGame');
});

var canvas = new fabric.Canvas('gameScreen', {renderOnAddRemove: false});
canvas.scale = function(object, scaleX, scaleY){
    object.left = object.left/object.scaleX * scaleX;
    object.top = object.top/object.scaleY * scaleY;
    object.scaleX = scaleX;
    object.scaleY = scaleY;
}
canvas.sadd = function(object){
    var scaleX = canvas.width / 1000;
    var scaleY = canvas.height / 700;
    this.scale(object, scaleX, scaleY);
    this.add(object);
}

selectScreen(canvas);