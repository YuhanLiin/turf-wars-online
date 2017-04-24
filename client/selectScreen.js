var views = require('./allViews.js');

var selectBoxes = [];
var charDisplays = [];
var skillDisplays = [];
var selected = 0;

function selectScreen(canvas) {
    $('canvas').off('keydown');

    canvas.setBackgroundColor('darkblue');
    //Title at top
    var title = new fabric.Text('Select Your Character', {
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 60,
        fill: 'white',
        top: 20
    })
    canvas.sadd(title);
    title.centerH();

    var x = 200;
    for (let charName in views){
        let box = SelectBox(x, 550, 100, charName)
        canvas.sadd(box)
        selectBoxes.push(box);
        //Width of the box plus the stroke on both sides
        x += 110;

        let charDisplay = CharDisplay(0, 100, 400, 400, charName);
        canvas.sadd(charDisplay);
        charDisplays.push(charDisplay);

        let skillDisplay = SkillDisplay(400, 100, 600, 400, charName);
        canvas.sadd(skillDisplay);
        skillDisplays.push(skillDisplay);
    }
}

function SelectBox(x, y, length, charName){
    var square = new fabric.Rect({
        originX: 'center',
        originY: 'center',
        fill: 'green',
        stroke: 'gray',
        width: length,
        height: length,
        strokeWidth: length/20
    });

    var offset = 6;
    var char = views[charName].Sprite(0, 0, length/2-offset);
    char.set({originY:'center', originX:'center'});

    var box = new fabric.Group([square, char], {
        left:x,
        top:y
    });
    box.name = charName;
    return box;
};

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

    var char = views[charName].Sprite(0, name.getBoundingRectHeight()+30, height / 3);
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
        originX: 'center',
        fill: ''
    });

    var skillText = new fabric.Textbox('Skills', {
        originX: 'center',
        textAlign: 'center',
        top: 20,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 50,
        fill: 'white'
    });

    var group = new fabric.Group([rect, skillText], {
        left:x,
        top: y,
        originX: 'left',
        originY: 'top'
    });

    let yoffset = skillText.getBoundingRectHeight() + 40;
    views[charName].skills.forEach(function (skill, i) {
        let desc = SkillDesc(0, i * 100, 100, 80, skill);
        desc.set({originX: 'left', originY: 'top'})
        group.add(desc);
    });
    group.addWithUpdate();

    return group;
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

    var description = new fabric.Textbox(skill.description, {
        fontFamily: 'sans-serif',
        fontSize: 16,
        fill: 'white',
        left: xoffset,
        top: title.getBoundingRectHeight(),
        width: width - xoffset,
        height: height - title.getBoundingRectHeight()
    });

    return new fabric.Group([icon, title, description], {
        left: x,
        top: y
    })
}

module.exports = selectScreen;