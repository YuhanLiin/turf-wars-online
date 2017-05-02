var Game = require('./game/game.js');
var repo = require('./repository.js');
var Input = require('./game/input.js');

var games = {};
var inputManagers = {};

//Handles game specific messages
repo.sub.on('pmessage', function(pattern, channel, message){
    //Receives and redirects all input messages to correct inputmanagers
    if (pattern === 'Input/*') {
        var userId = channel.replace('Input/', '');
        var input = inputManagers[userId];
        if (input){
            input.process(message);
        }
    }
    //Delete game and all its player's input managers when someone leaves at the end
    else if (channel === 'Games/delete'){
        var game = games[message];
        if (game){
            game.isDone = true;
            Object.keys(game.inputs).forEach(id=>delete inputManagers[id]);
        }
        delete games[message];
    }   
});

//Creates a game and maps it to its ID
function createGame(gameMap){
    //Construct character JSON
    gameMap = JSON.parse(gameMap);
    var gameId = gameMap.pop();

    //Construct serverside input managers and register them
    var inputJson = gameMap.reduce(function (json, pair) {
        let id = pair[0];
        json[id] = Input();
        inputManagers[id] = json[id];
        return json;
    }, {});
    var game = games[gameId] = Game(gameMap, inputJson);
    //Tell clients to start game first
    gameMap.forEach(pair=>sendUpdate('start', pair[0], JSON.stringify(gameMap)));
    //Make game happen after 30ms delay to give clients time to start
    setTimeout(()=>game.start(), 30);
    //For debugging
    return game;
}

//Only send updates to redis if game is not done. Ignore errors
function sendUpdate(topic, userId, message) {
    if (!this.isDone){
        repo.sendOutput(topic, userId, message)
        .catch(err=>{});
    }    
}

Game.inject(setTimeout, sendUpdate);

module.exports = createGame;