var Input = require('../game/input.js');
var Game = require('../game/game.js');

function createGame(state, gameMap) {
    function updateGame(tick) {
        state.canvas.srenderAll();
        fabric.util.requestAnimFrame(tick);
    }

    Game.inject(updateGame, function () { });

    //Set up game
    var inputs = { 'you': state.playerControls.makeInputManager(), 'other': Input() };
    var game = Game(gameMap, inputs);

    return game;
}

module.exports = createGame;