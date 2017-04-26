var views = require('../views/allViews.js');

function Header(x, y, width, height, playerName, charName, textColor){
    var name = new fabric.Textbox(playerName, {
        textAlign: 'center',
        originX: 'center',
        width: width,
        top: 10,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 40,
        fill: textColor
    });
    var char = views[charName].Sprite(0, height*2 / 3, width / 2 - 5);
    return new fabric.Group([char, name],{
        left:x, top:y
    });
}

function Hud(x, y, width, height, playerName, charName, textColor) {
    //Put header at top
    var header = Header(x, y, width, height * 2 / 7, playerName, charName, textColor);
    header.set('originX', 'center');
    //Generate skill icons vertically
    var yoffset = height * 2 / 7;
    var components = views[charName].skills.map(function (skill) {
        var icon = skill.Icon(0, yoffset, height / 8);
        icon.set('originX', 'center');
        yoffset += height / 6;
        return icon;
    });
    components.push(header);
    return new fabric.Group(components, {
        left: x,
        top: y
    });
}

module.exports.Hud = Hud;