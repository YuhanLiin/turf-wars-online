var display = require('./dataDisplay.js');
var SelectBox = require('./selectBox.js');
var views = require('../views/allViews.js');

//Changes canvas to the select screen
function selectScreen(canvas, socket) {
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

    function keyHandler(e){
        var key = e.which;
        if (key === 37 || key === 39){
            e.preventDefault();
            remove();
            if (key === 37) selectLeft();
            else selectRight();
            render();
        }
    }
    canvas.srenew('darkblue', keyHandler);

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

        let charDisplay = display.CharDisplay(0, 100, 400, 450, charName);
        charDisplays.push(charDisplay);

        let skillDisplay = display.SkillDisplay(400, 100, 600, 450, charName);
        skillDisplays.push(skillDisplay);
    }
    render();
}

module.exports = selectScreen;