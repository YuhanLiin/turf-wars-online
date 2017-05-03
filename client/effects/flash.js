function flash(state, color, times, cb=()=>{}) {
    var current = 0;
    //Rectangle overlays whole screen when flashing
    var rect = new fabric.Rect({
        left: 0, top: 0,
        fill: color,
        width: 2000, height: 2000
    });

    var id = setInterval(function(){
        //Alternate between remove and add every tick
        if(current%2) state.canvas.sadd(rect);
        else state.canvas.remove(rect);
        //Dont use srender, which updates all values and only works when rendering for actual game
        state.canvas.renderAll();
        current++;
        //Every flash consists of 1 on and 1 off tick plus 1 more to clear before the callback
        if (current >= times*2 + 1) {
            clearInterval(id);
            cb();
        }
    }, 150);
}

module.exports = flash;