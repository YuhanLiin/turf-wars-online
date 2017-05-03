var selectScreen = require('./selectScreen/selectScreen.js');
var gameScreen = require('./gameScreen/gameScreen.js');
var loadScreen = require('./staticScreens/loadScreen.js');
var endScreen = require('./staticScreens/endScreen.js');
var canvas = require('./canvas.js');
var Controls = require('./controls.js')
var boot = require('./bootstrapper.js');
var flash = require('./effects/flash.js');

//Websockets only
var socket = io('/room',  {transports: ['websocket'], upgrade: false});
//Consists of waitPlayer, select, waitSelect, game, end
var curScreen = '';

//State accessed by each screen
var state = {
    updateViewFunctions: [],
    canvas: canvas, 
    playerControls: Controls(),
    //The ID of the animation interval used by loading screen
    intervalId: null,
    reset() {
        this.canvas.clear();
        this.canvas.realGroups = [];
        //Stop current loading screen animation
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

//Set up conditions for ending screen from any screen. Makes sure endscreen cannot transition to anything else
function end(){
    curScreen = 'end';
    //Clear all event handlers
    socket.off('startGame');
    socket.off('startMatch');
    socket.off('disconnectWin');
    socket.off('lose');
    socket.off('win');
    socket.off('draw');
    socket.off('oUpdate');
    //End currently running game
    boot.endGame();
    //Clear control handlers
    state.playerControls.clear();
}

//Modifies the curScreen variable and shows the next screen on canvas. Removes old socket listeners and put on new ones
function nextScreen(...args){
    switch(curScreen){
        //Before the first call. This will initialize handlers for first loading screen
        case '':
            curScreen = 'waitPlayer';
            //1st load screen
            loadScreen(state, 'Waiting for player to join');
            //Go to next screen after receiving notif
            socket.on('startGame', function(){
                nextScreen();
            });
            break;

        //Waiting for other player to join
        case 'waitPlayer':
            curScreen = 'select';
            //Clear handler from previous screen
            socket.off('startGame');
            //Let this screen handle inputs and nextScreen calls
            selectScreen(state);
            break;

        //Character select
        case 'select':
            //Receive character name as param
            var character = args[0];
            curScreen = 'waitSelect';
            //2nd load screen and wait for both players to pick character
            loadScreen(state, 'Waiting for opponent');
            socket.on('startMatch', function(gameMap){
                nextScreen(gameMap);
            });
            //Tell server of character choice
            socket.emit('selectChar', character);
            break;

        //Waiting for both players to pick
        case 'waitSelect':
            //Receive game initialization data as param
            var gameMap = args[0];
            console.log(gameMap)
            curScreen = 'game';
            socket.off('startMatch');
            //Start the game and game UI. Game bootstrapper will handle the socket calls and nextScreen calls
            gameScreen(state, boot.createGame(state, gameMap, socket));
            //TODO handle game result and go on to result screen
            break;

        //Use default game ending messages
        case 'game':
            var ending = args[0];
            //Flash a few times before actually ending game
            var flashColor = (ending === 'lose') ? 'red' : 'black';
            flash(state, flashColor, 4, function(){
                end();
                endScreen(state, ending);
            });
            break;

        default:
            console.log('WTF');
    }
}
//Bind this function to state
state.nextScreen = nextScreen

socket.emit('roomId', roomId);
//Log all issues
socket.on('issue', function (issue) {
    console.log(issue);
});

//If opponent disconnects, show conclusion screen and set the screen state accordingly
socket.on('disconnectWin', function(){
    end();
    endScreen(state, 'win', 'since the other guy disconnected.');
})


nextScreen();

//endScreen(state, 'win', 'LOLWTF')
//selectScreen(state);
// gameScreen(state, boot.createGame(state, [['you','Slasher'], ['other','Slasher']], socket));
// flash(state, 'black', 5)
//loadScreen(state, 'Loading');