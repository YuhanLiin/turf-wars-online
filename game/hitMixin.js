//Server version of mixin to check if box1 hit box 2
var hitCheck(box1, box2){
        var deltax = box1.posx - box2.posx;
        var deltay = box1.posy - box2.posy;
        var dist = Math.sqrt(deltax*deltax + deltay*deltay);
        if (dist < box1.radius + box2.radius){
            box1.onHit(box2);
        }
    }

module.exports = hitCheck;