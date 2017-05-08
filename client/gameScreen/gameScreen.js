var Hud = require('./playerHud.js');
var Turf = require('./turf.js');

var playerHudColour = { 'you': 'white', 'other': 'red' };

function gameScreen(state, game) {
    //Reset the canvas but don't touch the controls since they are already configured
    state.reset();
    state.canvas.setBackgroundColor('darkblue');
    //Make the HUD sidebar for each player
    var huds = [];
    for (let player in game.characters) {
        let char = game.characters[player];
        //Sidebar positions depend on where player starts
        if (char.posx < 350) {
            huds.push(Hud(50, 10, 100, 700, player, char, playerHudColour[player], 0, 200));
        }
        else {
            huds.push(Hud(950, 10, 100, 700, player, char, playerHudColour[player], 500, 40));
        }
    }
    
    var turf = Turf(100, 0, game);
    //Add groups to canvas
    turf.projViews.forEach(projView=>state.canvas.saddGroup(projView));
    state.canvas.saddGroup(turf);
    state.canvas.sadd(huds[0]);
    huds[0].moveTo(10);
    state.canvas.sadd(huds[1]);
    huds[1].moveTo(10);
    state.canvas.srenderAll();

    state.updateViewFunctions.push(turf.update, huds[0].update, huds[1].update);
    game.start();
}

module.exports = gameScreen;