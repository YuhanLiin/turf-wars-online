var Input = require('../game/input.js');
var Game = require('../game/game.js');

function createGame(state, gameMap) {
    function updateGame(tick) {
        //if (game.frameCount < 150 ) console.log(game)
        state.updateViews();
        state.canvas.srenderAll();
        fabric.util.requestAnimFrame(tick);
    }

    Game.inject(updateGame, function () { });

    //Clear other inputs
    state.playerControls.clear();
    //Set up game
    var inputs = { 'you': state.playerControls.makeInputManager(), 'other': Input() };
    var game = Game(gameMap, inputs);

    return game;
}

module.exports = createGame;