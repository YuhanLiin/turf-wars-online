var views = require('../views/allViews.js');

//HUD part with player name and character sprite
function Header(x, y, width, height, playerName, charName, textColor){
    var name = new fabric.Textbox(playerName, {
        textAlign: 'center',
        originX: 'center',
        width: width,
        top: 10,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 36,
        fill: textColor
    });
    var char = views[charName].Sprite(0, height*2 / 3, width / 2 - 5);
    return new fabric.Group([char, name],{
        left: x, top: y,
        originX: 'center', originY: 'top'
    });
}

//Sidebar HUD that displays the character and skills owned by one player
//headerStart and iconStart customizes the positions of the player header and skill icons
function Hud(x, y, width, height, playerName, charName, textColor, headerStart, iconStart) {
    //Put header at top
    var header = Header(0, headerStart, width, height * 2 / 7, playerName, charName, textColor);
    //Generate skill icons vertically
    var components = views[charName].skills.map(function (skill) {
        var icon = skill.Icon(0, iconStart, height / 8);
        icon.set({originX: 'center', originY: 'top'});
        iconStart += height / 6;
        return icon;
    });
    components.push(header);
    return new fabric.Group(components, {
        left: x,
        top: y,
        originX: 'center',
        originY: 'top'
    });
}

module.exports.Hud = Hud;