var selectScreen = require('./selectScreen/selectScreen.js');
var gameScreen = require('./gameScreen/gameScreen.js');
var loadScreen = require('./loadScreen/loadScreen.js');
var canvas = require('./canvas.js');

var socket = io('/room',  {transports: ['websocket'], upgrade: false});
socket.emit('roomId', roomId);
//Change issue handling later
socket.on('issue', function (issue) {
    console.log(issue);
});
socket.on('startGame', function () {
    console.log('startGame');
});



//selectScreen(canvas, socket);
gameScreen(canvas, socket, [['you','Slasher'], ['other','Slasher']]);
//loadScreen(canvas, socket, 'Loading');