var views = require('../views/allViews.js');
var capitalize = fabric.util.string.capitalize;

//HUD part with player name and character sprite
function Header(x, y, width, height, playerName, char, textColor){
    var nameText = new fabric.Textbox(capitalize(playerName), {
        textAlign: 'center',
        originX: 'center',
        width: width,
        top: 10,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 36,
        fill: textColor
    });
    var charView = views[char.name].Sprite(0, height*2 / 3, width / 2 - 5);
    return new fabric.Group([charView, nameText],{
        left: x, top: y,
        originX: 'center', originY: 'top'
    });
}

//Sidebar HUD that displays the character and skills owned by one player
//headerStart and iconStart customizes the positions of the player header and skill icons
function Hud(x, y, width, height, playerName, char, textColor, headerStart, iconStart) {
    //Put header at top
    var header = Header(0, headerStart, width, height * 2 / 7, playerName, char, textColor);
    //Blue background
    var bg = new fabric.Rect({left:0, top:0, width:width, height:height, fill:'darkblue', originX: 'center', originY: 'top', fill:'darkblue'});

    //Generate skill icons vertically and bind them to character skills
     var components = views[char.name].skills.map(function (skill, i) {
        var icon = skill.Icon(0, iconStart, height / 9);
        icon.set({ originX: 'center', originY: 'top' });

        //Bind icons to character skill models
        icon.bind(char.skills[i]);
        iconStart += height / 6;
        return icon;
     });

    components.unshift(bg, header);
    var group = new fabric.Group(components, {
        left: x,
        top: y,
        //Positioned by center of x and top of y
        originX: 'center',
        originY: 'top',
        height: height
    });

    //Update all skillIcons; skip the header and background at beginning
    function update() {
        group.getObjects().forEach(function (component, i) {
            if (i > 1) component.update();
        });
    }
    group.update = update;
    return group;
}
module.exports = Hud;