var oneroot2 = 1 / Math.sqrt(2);

function Character(game, px, py, dx, dy) {
    var char = Object.create(Character.prototype);
    char.isMoving = false;
    char.canAct = true;
    char.canTurn = true;
    char.isAlive = true;
    char.isInvincible = false;
    char.posx = px;
    char.posy = py;
    char.facex = dx;
    char.facey = dy;
    char._limitx = game.width - char.radius;
    char._limity = game.height - char.radius;
    return char;
}
Character.prototype = {
    frameSpeed: 6, radius: 20,
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

    turn (dirx, diry) {
        //No movement input means character stops moving but faces same direction
        if (!dirx && !diry) this.isMoving = false;
            //Diagonal facing means both x and y are set but factors are scaled down according to Pythagoreas
        else if (dirx && diry) {
            this.isMoving = true;
            this.facex = dirx * oneroot2;
            this.facey = diry * oneroot2;
        }
            //Non diagonal means x and y are 1 and 0
        else {
            this.isMoving = true;
            this.facex = dirx;
            this.facey = diry;
        }
    }
};

module.exports = Character;