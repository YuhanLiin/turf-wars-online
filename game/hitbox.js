//Server and client side code. Server will get real hitbox mixin, client mixin will do nothing

//Default onhit behaviour kills other player
function kill(otherBox) {
    if (!otherBox.isInvincible)
        otherBox.isAlive = false;
}

//Attacks are hitboxes managed by their respective skills. Set instances per skill
function Attack(radius) {
    var box = Object.create(Hitbox.prototype);
    box.radius = radius;
    box.curFrame = 0;
    box.posx, box.posy;
    return box;
}

Attack.prototype = {
    onHit: kill,
    activate() {
        this.curFrame = 1;
    },

    deactivate() {
        this.curFrame = 0;
    },

    //Called by the skill every frame
    reposition(px, py) {
        this.posx = px;
        this.posy = py;
        if (this.curFrame > 0){
            this.curFrame++;
        }
    }
};

//Attacks managed by the game state; moves automatically and is not saved
function Projectile(radius, px, py, vx, vy){
    var proj = Object.create(Projectile.prototype);
    proj.radius = radius;
    proj.curFrame = 1;
    proj.velx = vx;
    proj.vely = vy;
    proj.posx = px;
    proj.posy = py;
}


Projectile.prototype = {
    onHit: kill,
    move(){
        this.posx += this.velx;
        this.posy += this.vely;
        curFrame++;
    }
};


module.exports.Attack = Attack;
module.exports.Projectile = Projectile;