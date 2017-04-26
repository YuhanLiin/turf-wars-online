function skillIconGenerator(skillName) {
    return function(x, y, length){
        var square = new fabric.Rect({
            originX: 'center',
            originY: 'center',
            fill: 'gray',
            stroke: 'orange',
            width: length,
            height: length,
            strokeWidth: length/10
        });

        //Load image??
        return new fabric.Group([square], {
            left: x,
            top: y
        });
    }
}

module.exports = skillIconGenerator;
