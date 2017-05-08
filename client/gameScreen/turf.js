var views = require('../views/allViews.js');
var RealGroup = require('../realGroup.js');

//Assumed to be same size as game board. Components all have bindings to game entities and will update when drawn
function Turf(x, y, game) {
    var turf = new fabric.Rect({
        left: 0,
        top: 0,
        width: game.width,
        height: game.height,
        originX: 'left', originY: 'top',
        fill: 'green'
    });

    var components = [turf];
    var projViews = [];
    //For each character and skill in game bind to a component view
    Object.keys(game.characters).forEach(function(player){
        var character = game.characters[player];
        //Bind character to view
        components.push(views[character.name].Sprite(100, 100, character.radius)
            .bind(character));
        views[character.name].skills.forEach(function(skill, i){
            //Bind each skill to views
            components.push(skill.Sprite().bind(character.skills[i]));
        });
        if (views[character.name].ProjectileView) {
            var projViewGroup = views[character.name].ProjectileView(character.projectileList, x, y);
            projViews.push(projViewGroup);
        }
    });

    var group = RealGroup(components, x, y);
    group.projViews = projViews;

    //Call update on all components other than the green backdrop
    function update() {
        //Update all projectile views
        group.projViews.forEach(function(projView){
            projView.update();
        });
        group.components.forEach(function (view, i) {
            if (i !== 0) {
                view.update();
            }
            else {
                view.set({ left: 0, top: 0 })
            }
        });
    }

    group.update = update;
    group.update();
    return group; 
}



module.exports = Turf;