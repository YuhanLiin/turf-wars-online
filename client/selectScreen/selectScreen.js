var display = require('./dataDisplay.js');
var SelectBox = require('./selectBox.js');
var views = require('../views/allViews.js');

//Changes state.canvas to the select screen
function selectScreen(state) {
    //Stores dynamic components corresponding to each character so they can be switched around for different selected chars
    var selectBoxes = [];
    var charDisplays = [];
    var skillDisplays = [];
    var charNames = [];
    var selected = 0;

    //Adds and renders dynamic content pertaining to selected character 
    function render(){
        selectBoxes[selected].set('stroke', 'red');
        state.canvas.sadd(charDisplays[selected]);
        state.canvas.sadd(skillDisplays[selected]);
        state.canvas.srenderAll();
    }

    //Removes dynamic content
    function remove(){
        selectBoxes[selected].set('stroke', 'gray');
        state.canvas.remove(charDisplays[selected]);
        state.canvas.remove(skillDisplays[selected]);
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

    
    state.reset();
    state.playerControls.clear();
    state.canvas.setBackgroundColor('darkblue');
    state.playerControls.registerHandler('up', function(input) {
        if (input === 'l' || input === 'r') {
            remove();
            if (input === 'l') selectLeft();
            else selectRight();
            render();
        }
        else if (input === 'enter'){
            var name = charNames[selected];
            state.nextScreen(name);
        }
    })

    //Title at top
    var title = new fabric.Text('Select Your Character', {
        textAlign: 'center',
        originX: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 60,
        fill: 'white',
        top: 20,
        left: 500
    })
    state.canvas.sadd(title);

    //Create character select boxes, character and skill displays for all available characters
    var x = 200;
    for (let charName in views){
        let box = SelectBox(x, 570, 100, charName)
        selectBoxes.push(box);
        state.canvas.sadd(box);
        //Increment x by width of the box plus the stroke on both sides
        x += 110;

        let charDisplay = display.CharDisplay(0, 100, 400, 450, charName);
        charDisplays.push(charDisplay);

        let skillDisplay = display.SkillDisplay(400, 100, 600, 450, charName);
        skillDisplays.push(skillDisplay);

        charNames.push(charName);
    }
    render();
}

module.exports = selectScreen;