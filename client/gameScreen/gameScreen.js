var hud = require('./playerHud.js');

function gameScreen(canvas, socket) {
    //Replace key handler
    canvas.srenew('darkblue', function () { });
    canvas.sadd(hud.Hud(50, 10, 100, 700, 'You', 'Slasher', 'white', 0, 200));
    canvas.sadd(hud.Hud(950, 10, 100, 700, 'Other', 'Slasher', 'white', 500, 0));
    canvas.renderAll();
}

module.exports = gameScreen;