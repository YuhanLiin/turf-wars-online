var colorMapping = {'win': 'purple', 'lose': 'red', 'draw': 'blue'};
var messageMapping = {
    'win': 'You hit the other guy first!',
    'lose': 'All it takes is one hit!',
    'draw': 'Both of you died on the exact same frame!'
};

//Screen marking end of the match
//Result is win, lose, or draw
function endScreen(state, result, text){
    //Default messages available for normal game endings can be overriden
    text = text || messageMapping[result]
    state.reset();
    state.playerControls.clear();
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