var views = require('../views/allViews.js');

var RealGroup = fabric.util.createClass(fabric.Object, {
    initialize(components, options){
        this.callSuper('initialize', options);
        this._components = components;
    },
    getObjects(){
        return this._components;
    },
    render(ctx, noTrans){
        this._transformDone = true;
        this.callSuper('render', ctx)
        this._components.forEach(function(item){
            var x = item.left, y = item.top, sx = item.scaleX, sy = item.scaleY;
            item.set({left: x+this.left, top: y+this.top, scaleX: sx*this.scaleX, scaleY: sy*this.scaleY});
            console.log(item)
            item.render(ctx);
            //item.set({left: x, top: y, scaleY: sy, scaleX: sx});
        });
        this._transformDone = false;
    }
});

//Assumed to be same size as game board
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

    var group = new RealGroup(components, {
        left: x, top: y, 
        originX: 'left', originY: 'top',
        width: game.width,
        height: game.height
    });
    group.update = update;
    group.update();
    return group; 
}

function update(){
    var self = this;
    this.getObjects().forEach(function(view, i){
        if (i !== 0){
            view.update();
        }
    });
}

module.exports = Turf;