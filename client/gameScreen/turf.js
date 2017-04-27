var views = require('../views/allViews.js');

//Fabricjs groups make no sense, so i use this instead
function RealGroup(components, x, y){
    var group = Object.create(RealGroup.prototype);
    group.left = x;
    group.top = y;
    group.components = components;
    return group;
}

RealGroup.prototype = {
    add(item){
        this.components.push(item);
    },
    //Apply realGroup offsets
    offsetAll(){
        var self = this;
        this.components.forEach(function(item){
            item.set({left: item.left+self.left, top: item.top+self.top});
        });
    },
    //Reset all component positions to original and also set scale back to 1 for correct resizing
    resetAll(){
        var self = this;
        this.components.forEach(function(item){
            item.set({left: item.left-self.left, top: item.top-self.top, scaleX:1, scaleY:1});
        })
    }
}

//Assumed to be same size as game board. Components all have bindings to game entities and will update when drawn
function Turf(x, y, game, gameMap) {
    var turf = new fabric.Rect({
        left: 0,
        top: 0,
        width: game.width,
        height: game.height,
        originX: 'left', originY: 'top',
        fill: 'green'
    });

    var components = [turf];

    gameMap.forEach(function(pair){
        var [player, charName] = pair;
        var character = game.characters[player];
        components.push(views[charName].Sprite(100, 100, character.radius)
            .bind(character));
        //Do this later
    });

    var group = RealGroup(components, x, y);
    group.update = update;
    group.update();
    return group; 
}

//Call update on all components other than the green backdrop
function update(){
    var self = this;
    this.components.forEach(function(view, i){
        if (i !== 0){
            view.update();
        }
    });
}

module.exports = Turf;