var hud = require('./playerHud.js');

function gameScreen(canvas, socket) {
    //Replace key handler
    canvas.srenew('darkblue', function () { });
    canvas.sadd(hud.Hud(0, 0, 100, 700, 'You', 'Slasher', 'white'));
    canvas.renderAll();
}

module.exports = gameScreen;