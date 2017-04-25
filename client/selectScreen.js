var views = require('./allViews.js');

//Changes canvas to the select screen
function selectScreen(canvas) {
    var selectBoxes = [];
    var charDisplays = [];
    var skillDisplays = [];
    var selected = 0;

    //Adds and renders dynamic content pertaining to selected character
    function render(){
        selectBoxes[selected].set('stroke', 'red');
        canvas.sadd(charDisplays[selected]);
        canvas.sadd(skillDisplays[selected]);
        canvas.renderAll();
    }

    //Removes dynamic content
    function remove(){
        selectBoxes[selected].set('stroke', 'gray');
        canvas.remove(charDisplays[selected]);
        canvas.remove(skillDisplays[selected]);
    }

    //Shifts character select to left and right with wrap around
    function selectLeft(){
        if (selected === 0) selected = selectBoxes.length-1;
        else selected -= 1;
    }
    function selectRight(){
        if (selected === selectBoxes.length-1) selected = 0;
        else selected += 1;
    }

    //Replace key handler
    $('*').off('keydown');
    $('*').keydown(function(e){
        var key = e.which;
        if (key === 37 || key === 39){
            e.preventDefault();
            remove();
            if (key === 37) selectLeft();
            else selectRight();
            render();
        }
    });

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
        let box = SelectBox(x, 570, 100, charName)
        selectBoxes.push(box);
        canvas.sadd(box);
        //Increment x by width of the box plus the stroke on both sides
        x += 110;

        let charDisplay = CharDisplay(0, 100, 400, 450, charName);
        charDisplays.push(charDisplay);

        let skillDisplay = SkillDisplay(400, 100, 600, 450, charName);
        skillDisplays.push(skillDisplay);
    }
    render();
}

//Positioned around center
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
        top: 0
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

module.exports = selectScreen;