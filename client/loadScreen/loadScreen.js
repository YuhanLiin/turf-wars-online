function loadScreen(state, text) {
    state.reset();
    state.canvas.setBackgroundColor('lightgray');
    //Display input text in middle of screen
    var txtDisplay = new fabric.Text(text, {
        fill: 'white',
        originX: 'center',
        originY: 'center',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontSize: 100,
        top: 350,
        left: 460
    });
    state.canvas.sadd(txtDisplay);
    state.canvas.srenderAll();

    //Number of dots at the end of text, which is incremented
    var dots = 1;
    //Animate the text every 100ms
    state.canvas.intervalId = setInterval(function () {
        //Dots loop from 1 to 3
        if (dots >= 3) dots = 1;
        else dots++;
        txtDisplay.setText(text + '.'.repeat(dots));
        state.canvas.renderAll();
    }, 500);
}

module.exports = loadScreen;