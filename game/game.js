//Used server and clientside
var Input = require('input.js')

//Maps character names to factories
var roster = {}
var oneroot2 = 1/Math.sqrt(2);
//Max # of frames that can be processed every run(), to prevent accumulating delta time
var maxFrameSkips = 10;

//Game factory has frame advancing function as injected dependancies
//Responsible for input, output, and game loop
function Game(gameJson, nextFrame){
    var game = Object.create(Game.prototype);
    //Size of game field
    game.height = 700;
    game.width = 800;
    game.isDone = false;
    game.frameCount = 0;
    game.id = gameJson.gameId;
    //Maps players to their characters
    game.players = {};
    //Player either starts top right or bottom left
    var startPositions = [{px: 40, py: 40, dx: 1, dy: 1}, {px: game.width-40, py: game.height-40, dx: -1, dy: -1}]
    for (let prop in gameJson){
        //Populates players object
        if (prop !== 'gameId') {
            let args = startPositions.pop();
            //Constructs character models and their positions on the map
            game.players[prop] = roster[gameJson[prop]](game, args.px, args.py, args.dx, args.dy);
        }
    }
    //Input record object
    game.input = Input();
    game.nextFrame = nextFrame;
    return game;
}

Game.frameTime = 1000/30;

Game.prototype = {
    //Starts the game loop
    start(){
        //Time of previous tick
        this.then = Date.now();
        //Time between previous and current tick
        this.delta = 0;
        this.run();
    },

    //Computes each tick of game loop
    run(){
        var now = Date.now();
        //Accumulate delta to account for remainder from last frame
        this.delta += now - this.then;
        this.then = now;
        //For every single frame that should have passed between this tick and the last
        for (let skip=0; this.delta >= Game.frameTime; this.delta -= Game.frameTime, skips++){
            //Update game state and stop game loop if game is done
            update();
            if (this.isDone) return;
            //If the number of frames per tick is too high, discard the remaining frames
            if (skips >= maxFrameSkips) this.delta = 0;
        } 
        //Propagate to the next frame to gather more delta
        this.nextFrame(run);
    },

    //Code that runs every frame. Updates game state by checking input records
    update(){
        this.frameCount++;
        //Update the characteristics of each character according to the input
        for (let player in this.players){
            let char = this.players[player];
            let dirx = this.input[player].vert, diry = this.input[player].hori;

            //No movement input means character stops moving but faces same direction
            if (!dirx && !diry) char.isMoving = false;
            //Diagonal facing means both x and y are set but factors are scaled down according to Pythagoreas
            else if (dirx && diry){
                char.isMoving = true;
                char.facex = dirx*oneroot2;
                char.facey = diry*oneroot2;
            }
            //Non diagonal means x and y are 1 and 0
            else{
                char.isMoving = true;
                char.facex = dirx;
                char.facey = diry;
            }
            char.move();
        }
        //For now, end game after 150 frames
        if(this.frameCount >= 150) this.isDone = true;
    }
};