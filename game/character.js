function Character(game, px, py, dx, dy){
    var char = Object.create(Character.prototype);
    char.game = game;
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
        if (!isMoving) return;
        var dist = this.frameSpeed;
        this.posx += dist*this.facex;
        this.posy += dist*this.facey;
        //Bounds checking
        if (this.posx < this.radius) this.posx = this.radius;
        if (this.posy < this.radius) this.posy = this.radius;
        if (this.posx > this._limitx) this.posx = this._limitx;
        if (this.posy > this._limity) this.posy = this._limity;
    }
}