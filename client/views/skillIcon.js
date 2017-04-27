function skillIconGenerator(skillName) {
    return function (x, y, length) {
        var border = new fabric.Rect({
            originX: 'center',
            originY: 'center',
            fill: 'orange',
            width: length * 6 / 5,
            height: length * 6 /5
        })
        //Icon background
        var square = new fabric.Rect({
            originX: 'center',
            originY: 'center',
            fill: 'gray',
            //stroke: 'orange',
            width: length,
            height: length,
            //strokeWidth: length/10
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
        return new fabric.Group([border, square, letter], {
            left: x,
            top: y,
            width: length,
            height: length
        });
    }
}

module.exports = skillIconGenerator;
