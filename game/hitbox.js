var HitboxMixin = {
    hitCheck(otherBox){
        var deltax = this.posx - otherBox.posx;
        var deltay = this.posy - otherBox.posy;
        Math.sqrt()
    }
}


function Attack(radius) {
    var box = Object.create(Hitbox.prototype);
    box.radius = radius;
    box.curFrame = 0;
    return box;
}

Attack.prototype = {
    activate(px, py) {
        this.curFrame = 1;
        this.reposition();
        this._activate();
    },

    _activate(){},

    deactivate() {
        this.curFrame = 0;
    },

    reposition(px, py) {
        this.posx = px;
        this.posy = py;
    }
};

function Projectile(character, radius, frameSpeed, edgeDist=0, alignx=1, aligny=1){
    var proj = Object.assign(Object.create(Projectile.prototype), Hitbox(character, radius, edgeDist, alignx, aligny));
    proj.frameSpeed = frameSpeed;
}

Projectile.prototype = Object.assign(Object.create(Hitbox.prototype), {
    move() {
        this.posx += this.velx;
        this.posx += this.vely;
    },

    _activate(){
        this.velx = Math.round(this.character.facex * this.alignx * this.centerDist);
        this.vely = Math.round(this.character.facex * this.alignx * this.centerDist);
    }
});
