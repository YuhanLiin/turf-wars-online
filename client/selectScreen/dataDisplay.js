var views = require('../views/allViews.js');

function CharDisplay(x, y, width, height, charName){
    var rect = new fabric.Rect({
        width:width,
        height: height,
        stroke: 'white',
        strokeWidth: 2,
        originX: 'center',
        fill: ''
    });
    var name = new fabric.Textbox(charName, {
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 50,
        fill: 'white',
        top: 20,
        originX: 'center',
    });

    var char = views[charName].Sprite(0, name.getBoundingRectHeight()+height/3+35, height / 3);
    char.set({ originX: 'center' });
    return new fabric.Group([rect, char, name], {
        left:x,
        top:y,
    })
}

function SkillDisplay(x, y, width, height, charName){
    var rect = new fabric.Rect({
        width: width,
        height: height,
        stroke: 'white',
        strokeWidth: 2,
        top: 0,
        left: 0,
        fill: ''
    });

    var skillText = new fabric.Textbox('Skills', {
        textAlign: 'center',
        top: 20,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 50,
        fill: 'white',
        width: width
    });

    var components = [rect, skillText];
    var yoffset = skillText.getBoundingRectHeight() + 35;
    views[charName].skills.forEach(function (skill, i) {
        let desc = SkillDesc(width/8, yoffset+i*height/5, width*3/4, 70, skill);
        components.push(desc);
    });

    return new fabric.Group(components, {
        left:x,
        top: y,
    });;
}

//Assumes height < width, since icon will be square of length height
function SkillDesc(x, y, width, height, skill) {
    var icon = skill.Icon(0, 0, height);

    var xoffset = height + 30;
    var title = new fabric.Text(skill.name, {
        fontFamily: 'sans-serif',
        fontSize: 30,
        fill: 'white',
        left: xoffset,
        top: 0
    });

    var cdText = new fabric.Text('cooldown: '+skill.cooldown+' seconds', {
        fontFamily: 'sans-serif',
        fontSize: 16,
        fill: 'white',
        left: xoffset + title.getBoundingRectWidth() + 30,
        top: 10
    })

    var description = new fabric.Textbox(skill.description, {
        fontFamily: 'sans-serif',
        fontSize: 16,
        fill: 'white',
        left: xoffset,
        top: title.getBoundingRectHeight(),
        width: width - xoffset,
        height: height - title.getBoundingRectHeight()
    });

    return new fabric.Group([icon, title, cdText, description], {
        left: x,
        top: y,
        width: width,
        height: height
    })
}

module.exports.SkillDisplay = SkillDisplay;
module.exports.CharDisplay = CharDisplay;