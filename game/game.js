//Used server and clientside
var Input = require('./input.js');
var roster = {Slasher: require('./characters/slasher.js')};

//Responsible for input, output, and game loop; characterJson maps playerId to character name
function Game(characterJson){
    var game = Object.create(Game.prototype);
    game.isDone = false;
    game.frameCount = 0;
    //Maps players to their characters and input managers
    game.characters = {};
    game.inputs = {};
    //Player either starts top right or bottom left
    var startPositions = [{px: 40, py: 40, dx: 1, dy: 1}, {px: game.width-40, py: game.height-40, dx: -1, dy: -1}]
    for (let player in characterJson){
        //Populates players object
        let args = startPositions.pop();
        //Constructs character models and their positions on the map
        game.characters[player] = roster[characterJson[player]](game, args.px, args.py, args.dx, args.dy);
        game.inputs[player] = Input();
    }
    return game;
}

Game.frameTime = 1000/30;
//Max # of frames that can be processed every run(), to prevent accumulating delta time
Game.maxFrameSkips = 30;

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
                    self.frame();
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
        frame() {
            this.frameCount++;
            //Update the characteristics of each character according to the input
            for (let player in this.characters) {
                let char = this.characters[player];
                let input = this.inputs[player];
                let dirx = input.hori, diry = input.vert, skillNum = input.skill;
                char.receiveInput(dirx, diry, skillNum);
                char.frameProcess();
                char.attackList.forEach(hitbox=>this.checkAllHits(hitbox, player));
                char.projectileList.forEach(hitbox=>this.checkAllHits(hitbox, player));
            }
            this.checkVictory();
        },

        checkAllHits(hitbox, playerId){
            //Inactive hitboxes are skipped. Active hitboxes are checked against opponent
            if (hitbox.curFrame === 0) return;
            for (let id in this.characters){
                if (id !== playerId){
                    hitbox.checkHit(this.characters[id]);
                }
            }
        },

        checkVictory(){
            var alivePlayer, alivePlayerCount = 0;
            //Loop thru players and count the ones that are alive
            for (let playerId in this.characters){
                let char = this.characters[playerId];
                if (char.isAlive){
                    alivePlayerCount++;
                    alivePlayer = playerId;
                }
            }
            //End the game if last man standing or everyone's down
            if (alivePlayerCount <= 1){
                for (let playerId in this.characters){
                    if (playerId === alivePlayer){
                        sendUpdate('win', playerId);
                    }
                    //Dead players lose if someone else is alive; draw if everyone is down
                    else{
                        if (alivePlayerCount === 1) sendUpdate('lose', playerId);
                        else sendUpdate('draw', playerId);
                    }
                }
                this.isDone = true;
            }
        }
    };
};

module.exports = Game;