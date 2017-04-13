//Used server and clientside

//Responsible for input, output, and game loop; gameJson maps playerId to character name, inputJson maps playerId to input manager. 
function Game(gameJson, inputJson){
    var game = Object.create(Game.prototype);
    game.isDone = false;
    game.frameCount = 0;
    game.id = gameJson.gameId;
    //Maps players to their characters and input managers
    game.players = {};
    //Player either starts top right or bottom left
    var startPositions = [{px: 40, py: 40, dx: 1, dy: 1}, {px: game.width-40, py: game.height-40, dx: -1, dy: -1}]
    for (let prop in gameJson){
        //Populates players object
        if (prop !== 'gameId') {
            let args = startPositions.pop();
            var playerObj = game.players[prop] = {};
            //Constructs character models and their positions on the map
            playerObj.attacks = [];
            playerObj.projectiles = [];
            playerObj.character = Game.roster[gameJson[prop]](game, args.px, args.py, args.dx, args.dy);
            playerObj.input = inputJson[prop];
            playerObj.character.skills.map(skill=>skill.registerHitboxLists(playerObj.attacks, playerObj.projectiles));
        }
    }
    return game;
}

Game.frameTime = 1000/30;
//Maps character names to factories
Game.roster = {}
//Max # of frames that can be processed every run(), to prevent accumulating delta time
Game.maxFrameSkips = 10;

//Inject 2 dependencies that differ between client and server
//Next tick schedules the next tick of the game, sendUpdates sends game state to client/server
Game.inject = function (nextTick, sendUpdate) {
    Game.prototype = {
        nextTick: nextTick,
        sendUpdate: sendUpdate,

        //Size of game field
        height: 700,
        width: 800,

        //Starts the game loop. Run once per game
        start() {
            var then = Date.now();
            var delta = 0;
            var self = this;

            //Computes each tick of game loop
            function tick() {
                var now = Date.now();
                //Accumulate delta to account for remainder from last frame
                delta += now - then;
                then = now;
                //For every single frame that should have passed between this tick and the last
                for (let skips = 0; delta >= Game.frameTime; delta -= Game.frameTime, skips++) {
                    //Update game state and stop game loop if game is done
                    self.update();
                    if (self.isDone) return;
                    //If the number of frames per tick is too high, discard the remaining frames
                    if (skips >= Game.maxFrameSkips) delta = 0;
                }
                //Propagate to the next tick to gather more delta
                self.nextTick(tick);
            }
            tick();
        },

        //Code that runs every frame. Updates game state by checking input records
        update() {
            this.frameCount++;
            //Update the characteristics of each character according to the input
            for (let player in this.players) {
                let char = this.players[player].character;
                let input = this.players[player].input;
                let dirx = input.hori, diry = input.vert, skillNum = input.skill;

                char.frameProcess(dirx, diry, skillNum)
            }
            //For now, end game after 150 frames
            if (this.frameCount >= 150) this.isDone = true;
        }
    };
};

module.exports = Game;