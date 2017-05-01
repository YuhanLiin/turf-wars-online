var colorMapping = {'win': 'purple', 'lose': 'red', 'draw': 'blue'};

//Screen marking end of the match
//Result is win, lose, or draw
function endScreen(state, result, text){
    state.reset();
    state.playerControls.clear();
    console.log(colorMapping[result])
    state.canvas.setBackgroundColor(colorMapping[result]);

    var titleDisplay = new fabric.Text(('You '+result+'!!!').toUpperCase(), {
        fill: 'white',
        originX: 'center',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 100,
        top: 300,
        left: 500
    });

    var textDisplay = new fabric.Text(text, {
        fill: 'white',
        originX: 'center',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 40,
        top: titleDisplay.getBoundingRectHeight() + titleDisplay.top + 30,
        left: 500
    });

    state.canvas.sadd(titleDisplay);
    state.canvas.sadd(textDisplay);
    state.canvas.srenderAll();
}

module.exports = endScreen;