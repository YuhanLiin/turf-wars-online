//Use this canvas for rest of the game and configure it with methods
var canvas = new fabric.StaticCanvas('gameScreen', { renderOnAddRemove: false });

canvas.realGroups = [];

//Scale an object's position and size according to factors
canvas.sresize = function (object, scaleX, scaleY) {
    object.left = object.left / object.scaleX * scaleX;
    object.top = object.top / object.scaleY * scaleY;
    object.scaleX = scaleX;
    object.scaleY = scaleY;
}

//Scale all current objects
//Now all entities can be assumed to be on 1000x700 canvas
canvas.sresizeAll = function (){
    var scaleX = canvas.width / 1000;
    var scaleY = canvas.height / 700;
    var self = this;
    self.getObjects().forEach(function(item){
        self.sresize(item, scaleX, scaleY);
    });
}

canvas.sadd = function (object) {
    this.add(object);
}

//Add all entities in a real group
canvas.saddGroup = function (realGroup) {
    var self = this;
    realGroup.components.forEach(item=>self.sadd(item));
    this.realGroups.push(realGroup);
}

//Render all entities with realgroup offsets in mind
canvas.srenderAll = function (realGroup) {
    //Apply realGroup offsets
    this.realGroups.forEach(group=>group.offsetAll());
    //Apply canvas scale resize
    this.sresizeAll();
    this.renderAll();
}

module.exports = canvas;
