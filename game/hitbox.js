//Server and client side code. Server will get real hitbox mixin, client mixin will do nothing
var hitboxMixin = {
    checkHit (box1, box2) {
        var deltax = box1.posx - box2.posx;
        var deltay = box1.posy - box2.posy;
        var dist = Math.sqrt(deltax * deltax + deltay * deltay);
        if (dist < box1.radius + box2.radius) {
            box1.onHit(box2);
        }
    },
    onHit(otherBox) {
        if (!otherBox.isInvincible)
            otherBox.isAlive = false;
    }
}

//Default onhit behaviour kills other player


//Attacks are hitboxes managed by their respective skills. Set instances per skill
function Attack(radius) {
    var box = Object.create(Hitbox.prototype);
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
}


Projectile.prototype = Object.assign({
    move(){
        this.posx += this.velx;
        this.posy += this.vely;
        curFrame++;
    }
}, hitboxMixin);


module.exports.Attack = Attack;
module.exports.Projectile = Projectile;