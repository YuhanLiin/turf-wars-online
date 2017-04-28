var Hud = require('./playerHud.js');
var Turf = require('./turf.js');

var playerHudColour = { 'you': 'white', 'other': 'red' };

function gameScreen(state, game) {
    state.reset();
    state.canvas.setBackgroundColor('darkblue');
    var huds = [];
    for (let player in game.characters) {
        let char = game.characters[player];
        if (char.posx < 350) {
            huds.push(Hud(50, 10, 100, 700, player, char, playerHudColour[player], 0, 200));
        }
        else {
            huds.push(Hud(950, 10, 100, 700, player, char, playerHudColour[player], 500, 0));
        }
    }
    
    var turf = Turf(100, 0, game);
    //Add groups to canvas
    state.canvas.saddGroup(turf);
    state.canvas.sadd(huds[0]);
    state.canvas.sadd(huds[1]);
    state.canvas.srenderAll();

    state.updateViewFunctions.push(turf.update, huds[0].update, huds[1].update);
    game.start();
}

module.exports = gameScreen;