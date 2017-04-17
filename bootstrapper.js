var Game = require('./game/game.js');
var repo = require('./repo.js')

games = {};

//Receives and redirects all input messages to correct games
repo.pub.on('pmessage', function(pattern, channel, message){
    if (pattern === 'Input/*'){
        var gameId = channel.replace('Input/', '');
        var game = games[gameId];
        //Only if game is not done
        if (game && !game.isDone){
            var message = message.split(':');
            game.inputs[message[0]].process(message[1]);
        }
    }
    //Delete game when someone leaves at the end
    else if (channel === 'Games/delete'){
        delete games[message];
    }   
});

//Creates a game and maps it to its ID
function createGame(gameJson){
    gameJson = JSON.parse(gameJson);
    var gameId = gameJson.gameId;
    delete gameJson.gameId;
    games[gameId] = Game(gameJson);
}

//Only send updates to redis if game is not done. Ignore errors
function(topic, userId, message){
    if (!this.isDone){
        repo.sendOutput(topic, userId, message)
        .catch(err=>{});
    }    
}

Game.inject(setTimeout, sendOutput);

module.exports = createGame;