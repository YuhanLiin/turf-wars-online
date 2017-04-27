function skillIconGenerator(skillName) {
    return function(x, y, length){
        //Icon background and border
        var square = new fabric.Rect({
            originX: 'center',
            originY: 'center',
            fill: 'gray',
            stroke: 'orange',
            width: length,
            height: length,
            strokeWidth: length/10
        });

        //First letter of skill name in center of icon
        var letter = new fabric.Text(skillName[0], {
            originX: 'center',
            originY: 'center',
            fill: 'black',
            fontFamily: 'serif',
            fontSize: 50
        })

        //Load image??
        return new fabric.Group([square, letter], {
            left: x,
            top: y
        });
    }
}

module.exports = skillIconGenerator;
