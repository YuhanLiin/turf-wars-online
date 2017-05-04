var Input = require('../game/input.js');
var Game = require('../game/game.js');

var game;

function createGame(state, gameMap, socket) {
    //Client nextTick handler
    function updateGame(tick) {
        //if (game.frameCount < 150 ) console.log(game)
        state.updateViewFunctions.forEach(update=>update());
        //If the page is hidden from view then run updates in background
        if (document.hidden) setTimeout(tick);
        //Otherwise render normally
        else {
            state.canvas.srenderAll();
            fabric.util.requestAnimFrame(tick);
        }
    }

    //Client update handler
    function handleGameUpdates(topic, player, message){
        //For input updates send the player's inputs to server
        if (topic === 'update'){
            if (player === 'you') socket.emit('input', message);
        }
        //For game ending updates just resume the game
        else {
            this.isDone = false;
        }
    }

    Game.inject(updateGame, handleGameUpdates);

    //Clear other inputs
    state.playerControls.clear();
    //Set up game
    var inputs = { 'you': state.playerControls.makeInputManager(), 'other': Input() };

    socket.on('oUpdate', function(input){
        inputs.other.process(input);
    });

    socket.on('win', function(){
        state.nextScreen('win');
    });
    socket.on('lose', function(){
        state.nextScreen('lose');
    });
    socket.on('draw', function(){
        state.nextScreen('draw');
    });

    game = Game(gameMap, inputs);

    return game;
}

//End the continuous running of the game
function endGame(){
    if (game) {
        game.isDone = true;
    }
}

module.exports.createGame = createGame;
module.exports.endGame = endGame;