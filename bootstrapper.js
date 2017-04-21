var Game = require('./game/game.js');
var repo = require('./repository.js');
var Input = require('./game/input.js');

var games = {};
var inputManagers = {};

//Handles game specific messages
repo.pub.on('pmessage', function(pattern, channel, message){
    //Receives and redirects all input messages to correct inputmanagers
    if (pattern === 'Input/*'){
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
            Object.keys(game.inputs).forEach(id=>delete inputManagers[id]);
        }
        delete games[message];
    }   
});

//Creates a game and maps it to its ID
function createGame(gameJson){
    //Construct character JSON
    gameJson = JSON.parse(gameJson);
    var gameId = gameJson.gameId;
    delete gameJson.gameId;

    //Construct serverside input managers and register them
    var inputJson = Object.keys(gameJson).reduce(function(json, id){
        json[id] = Input();
        inputManagers[id] = json[id];
        return json;
    }, {});
    //Make game happen
    games[gameId] = Game(gameJson, inputJson);
    game.start();
}

//Only send updates to redis if game is not done. Ignore errors
function sendUpdate (topic, userId, message){
    if (!this.isDone){
        repo.sendOutput(topic, userId, message)
        .catch(err=>{});
    }    
}

Game.inject(setTimeout, sendUpdate);

module.exports = createGame;