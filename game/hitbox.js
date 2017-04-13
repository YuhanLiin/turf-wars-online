//Server and client side code. Server will get real hitbox mixin, client mixin will do nothing
var hitboxMixin = {
    checkHit (otherBox) {
        var deltax = this.posx - otherBox.posx;
        var deltay = this.posy - otherBox.posy;
        var dist = Math.sqrt(deltax * deltax + deltay * deltay);
        if (dist < this.radius + otherBox.radius) {
            this.onHit(otherBox);
        }
    },
    //Default onhit behaviour kills other player
    onHit(otherBox) {
        if (!otherBox.isInvincible)
            otherBox.isAlive = false;
    }
}


//Attacks are hitboxes managed by their respective skills. Set instances per skill
function Attack(radius) {
    var box = Object.create(Attack.prototype);
    box.radius = radius;
    box.curFrame = 0;
    box.posx, box.posy;
    return box;
}

Attack.prototype = Object.assign({
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
}, hitboxMixin);

//Attacks managed by the game state; moves automatically and is not saved
function Projectile(radius, px, py, vx, vy){
    var proj = Object.create(Projectile.prototype);
    proj.radius = radius;
    proj.curFrame = 1;
    proj.velx = vx;
    proj.vely = vy;
    proj.posx = px;
    proj.posy = py;
    return proj;
}


Projectile.prototype = Object.assign({
    move(){
        this.posx += this.velx;
        this.posy += this.vely;
        this.curFrame++;
    }
}, hitboxMixin);


module.exports.Attack = Attack;
module.exports.Projectile = Projectile;