var selectScreen = require('./selectScreen/selectScreen.js');
var gameScreen = require('./gameScreen/gameScreen.js');
var loadScreen = require('./staticScreens/loadScreen.js');
var endScreen = require('./staticScreens/endScreen.js');
var canvas = require('./canvas.js');
var Controls = require('./controls.js')
var boot = require('./bootstrapper.js');

//Websockets only
var socket = io('/room',  {transports: ['websocket'], upgrade: false});
//Consists of waitPlayer, select, waitSelect, game, end
var curScreen = '';

socket.emit('roomId', roomId);
//Log all issues
socket.on('issue', function (issue) {
    console.log(issue);
});

//If opponent disconnects, show conclusion screen and set the screen state accordingly
socket.on('disconnectWin', function(){
    curScreen = 'end'
})

//State accessed by each screen
var state = {
    updateViewFunctions: [],
    canvas: canvas, 
    selectedChar: null,
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
            selectScreen(state);
            //If enter button is pressed then proceed to next screen
            state.playerControls.registerHandler('up', function(input){
                if (input === 'enter') nextScreen(state.selectedChar);
            })
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
            curScreen = 'game';
            socket.off('startMatch');
            //Start the game and game UI. Game bootstrapper will handle the socket calls
            gameScreen(state, boot(state, gameMap, socket));
            //TODO handle game result and go on to result screen
            break;

        case 'game':
            //TODO
            break;

        default:
            console.log('WTF');
    }
}
//nextScreen();

endScreen(state, 'win', 'LOLWTF')
//selectScreen(state);
//gameScreen(state, boot(state, [['you','Slasher'], ['other','Slasher']]));
//loadScreen(state, 'Loading');