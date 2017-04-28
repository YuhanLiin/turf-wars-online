var views = require('../views/allViews.js');
var RealGroup = require('../realGroup.js');

//Assumed to be same size as game board. Components all have bindings to game entities and will update when drawn
function Turf(x, y, game, gameMap, iconJson) {
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
        //Bind character to view
        components.push(views[charName].Sprite(100, 100, character.radius)
            .bind(character));
        views[charName].skills.forEach(function(skill, i){
            //Bind each skill to views
            components.push(skill.Sprite().bind(character.skills[i]));
            //Bind each skill to icons as well, but dont add to components since they are not in same group
            iconJson[player].bind(character.skills[i]);
        })
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