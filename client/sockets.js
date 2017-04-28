var selectScreen = require('./selectScreen/selectScreen.js');
var gameScreen = require('./gameScreen/gameScreen.js');
var loadScreen = require('./loadScreen/loadScreen.js');
var canvas = require('./canvas.js');
var Controls = require('./controls.js')
var createGame = require('./bootstrapper.js');

var socket = io('/room',  {transports: ['websocket'], upgrade: false});
socket.emit('roomId', roomId);
//Change issue handling later
socket.on('issue', function (issue) {
    console.log(issue);
});
socket.on('startGame', function () {
    console.log('startGame');
});

//State accessed by each screen
var state = {
    canvas: canvas, 
    socket: socket, 
    playerControls: Controls(),
    //The ID of the animation interval used by loading screen
    intervalId: null,
    reset() {
        this.canvas.clear();
        this.canvas.realGroups = [];
        //Clear key events
        $('body').off('keydown');
        $('body').off('keyup');
        //Stop current loading screen animation
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

//selectScreen(state);
gameScreen(state, createGame(state, [['you','Slasher'], ['other','Slasher']]));
//loadScreen(state, 'Loading');