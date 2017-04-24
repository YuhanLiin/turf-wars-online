var charViews = require('./charView.js');

var selectBoxes = [];
var charDisplays = [];
var skillDisplays = [];
var selected = 0;

function selectScreen(canvas, ratio) {
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
    for (let charName in charViews){
        let box = SelectBox(x, 550, 100, charName)
        canvas.sadd(box)
        selectBoxes.push(box);

        let charDisplay = CharDisplay(0, 100, 400, 400, charName);
        canvas.sadd(charDisplay);
        charDisplays.push(charDisplay);

        let skillDisplay = SkillDisplay(400, 100, 600, 400, charName);
        canvas.sadd(skillDisplay);
        skillDisplays.push(skillDisplay);
        x += 100;
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
        strokeWidth: 5
    });

    var offset = 6;
    var char = charViews[charName](0, 0, length/2-offset);
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
        height:height,
        stroke: 'black',
        originX: 'center',
        originY: 'center',
        fill: ''
    });
    var name = new fabric.Text(charName, {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 50,
        fill: 'white',
        originX: 'center',
        originY: 'bottom',
        top:-height*2/7
    });
    var yoffset = 30;
    var char = charViews[charName](0, yoffset, height/3);
    char.set({originY:'center', originX:'center'});
    return new fabric.Group([rect, char, name], {
        left:x,
        top:y,
        width:width,
        height:height
    })
}

function SkillDisplay(x, y, width, height, charName){
    var rect = new fabric.Rect({
        width:width,
        height:height,
        stroke: 'black',
        originX: 'center',
        originY: 'center',
        fill: ''
    });
    var skillText = new fabric.Text('Skills', {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 50,
        fill: 'white'
    });
    return new fabric.Group([rect, skillText], {
        left:x,
        top:y,
        width:width,
        height:height
    });
}

module.exports = selectScreen;