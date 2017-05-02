var Input = require('../game/input.js');
var Game = require('../game/game.js');

var game;

function createGame(state, gameMap, socket) {
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

    function handleGameUpdates(topic, player, message){
        if (topic === 'update'){
            if (player === 'you') socket.emit('input', message);
        }
        //else this.isDone = false;
    }

    Game.inject(updateGame, handleGameUpdates);

    //Clear other inputs
    state.playerControls.clear();
    //Set up game
    var inputs = { 'you': state.playerControls.makeInputManager(), 'other': Input() };

    socket.on('oUpdate', function(input){
        inputs.other.process(input);
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