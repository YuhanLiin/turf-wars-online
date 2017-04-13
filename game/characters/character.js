var oneroot2 = 1 / Math.sqrt(2);

function Character(game, px, py, dx, dy) {
    var char = Object.create(Character.prototype);
    char.posx = px;
    char.posy = py;
    char.facex;
    char.facey;
    //Turn the player to initial direction but disable movement
    char.turn(dx, dy);
    char.isMoving = false;
    char.canAct = true;
    char.canTurn = true;
    char.isAlive = true;
    char.isInvincible = false;
    //Precomputed boundaries
    char._limitx = game.width - char.radius;
    char._limity = game.height - char.radius;
    return char;
}
//Excluded baseSpeed, frameSpeed, and skills, a 4 element Skill array

//All characters will share this prototype
Character.prototype = {
    radius: 20,
    //Used to initialize speed
    setSpeed(speed){
        this.baseSpeed = speed;
        this.frameSpeed = speed;
    },

    setSkills(game, ...factories){
        this.skills = factories.map(factory=>factory(this, game.attackList, game.projectileList))
    }

    move (){
        if (!this.isMoving) return;
        var dist = this.frameSpeed;
        this.posx += Math.round(dist*this.facex);
        this.posy += Math.round(dist*this.facey);
        //Bounds checking
        if (this.posx < this.radius) this.posx = this.radius;
        if (this.posy < this.radius) this.posy = this.radius;
        if (this.posx > this._limitx) this.posx = this._limitx;
        if (this.posy > this._limity) this.posy = this._limity;
    },

    //Determines player's facing values based on directional input.
    turn (dirx, diry) {
        //No movement input means character stops moving but faces same direction
        if (!dirx && !diry) this.isMoving = false;
        else {
            this.isMoving = true;
            //Character cant turn but can still move
            if (!this.canTurn) return;
            //Diagonal facing means both x and y are set but factors are scaled down according to Pythagoreas
            if (dirx && diry) {               
                this.facex = dirx * oneroot2;
                this.facey = diry * oneroot2;
            }
            else {
                this.facex = dirx;
                this.facey = diry;
            }
        }
    },

    //Takes user input and runs all of character's processing for one frame. Returns whether a skill was used or not
    frameProcess(dirx, diry, skillNum){
        //Determine facing, process skills, then move (allows dashes on frame 1)
        var skillUsed = false;
        this.turn (dirx, diry);
        if (skillNum) skillUsed = this.skills[skillNum-1].use();
        //Propagates frame process
        for (let i=0; i<this.skills.length; i++){
            this.skills[i].frameProcess();
        }
        this.move();
        return skillUsed;
    }
};

module.exports = Character;