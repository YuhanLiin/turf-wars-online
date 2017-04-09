//Maps character names to factories
var roster = {}

function Game(gameJson, inputManager){
    var game = Object.create(Game.prototype);
    game.height = 700;
    game.width = 800;
    game.isDone = false;
    game.frameCount = 0;
    game.id = gameJson.gameId;
    //Maps players to their characters
    game.players = {};
    var startPositions = [{px: 40, py: 40, dx: 1, dy: 1}, {px: game.width-40, py: game.height-40, dx: -1, dy: -1}]
    for (let prop in gameJson){
        //Populates players object
        if (prop !== 'gameId') {
            let args = startPositions.pop();
            game.players[prop] = roster[gameJson[prop]](game, args.px, args.py, args.dx, args.dy);
        }
    }
    game.input = inputManager(game);
    return game;
}

Game.prototype = {frameTime: 1000/30,
    run(){
        if (!this.isDone){
            setTimeout(this.run, frameTime);
        }
        this.frameCount++;
        for (let player in this.players){
            let char = this.players[player];
            let dirx = this.input[player].dirx, diry = this.input[player].diry;

            if (!dirx && !diry) char.isMoving = false;
            else if (dirx && diry){
                char.isMoving = true;
                char.facex = dirx/Math.sqrt(2);
                char.facey = diry/Math.sqrt(2);
            }
            else{
                char.isMoving = true;
                char.facex = dirx;
                char.facey = diry;
            }
            char.move();
        }
        if(this.frameCount >= 150) this.isDone = true;
    }
};