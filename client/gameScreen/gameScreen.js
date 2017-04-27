var Hud = require('./playerHud.js');
var Turf = require('./turf.js');
var Input = require('../../game/input.js');
var Game = require('../../game/game.js');

var playerHudColour = {'you': 'white', 'other': 'red'};
Game.inject(function(){}, function(){});

function gameScreen(canvas, socket, gameMap) {
    canvas.srenew('darkblue', function () { });
    //Player1 gets left HUD
    canvas.sadd(Hud(50, 10, 100, 700, gameMap[0][0], gameMap[0][1], playerHudColour[gameMap[0][0]], 0, 200));
    //Player2 gets right HUD
    canvas.sadd(Hud(950, 10, 100, 700, gameMap[1][0], gameMap[1][1], playerHudColour[gameMap[1][0]], 500, 0));
    //Set up game
    var inputs = {'you': Input(), 'other': Input()};
    var game = Game(gameMap, inputs);
    canvas.sadd(Turf(100,0,game, gameMap));
    canvas.renderAll();
}

module.exports = gameScreen;