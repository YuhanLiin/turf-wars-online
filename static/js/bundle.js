(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var charView = require('./charView.js');
var IconGen = require('./skillIcon.js');

module.exports.Slasher = {
    Sprite: charView.SlasherView,
    skills: ['Cut', 'Dash', 'Dodge', 'Vortex'].map(function (name) {
        return {
            name: name,
            description: "placeholder",
            Icon: IconGen('Slasher', name)
        };
    })
};
},{"./charView.js":2,"./skillIcon.js":4}],2:[function(require,module,exports){
function SlasherView(x, y, radius){
    var outer = new fabric.Circle({
        radius: radius,
        fill: 'red',
        originX: 'center',
        originY: 'center'
    });

    var middle = new fabric.Circle({
        radius: radius*2/3,
        fill: 'black',
        originX: 'center',
        originY: 'center'
    });

    var inner = new fabric.Circle({
        radius: radius/3,
        fill: 'red',
        originX: 'center',
        originY: 'center'
    });

    return new fabric.Group([outer, middle, inner], {
        left: x,
        top: y
    });
}

module.exports.SlasherView = SlasherView;
},{}],3:[function(require,module,exports){
var views = require('./allViews.js');

var selectBoxes = [];
var charDisplays = [];
var skillDisplays = [];
var selected = 0;

function selectScreen(canvas) {
    $('canvas').off('keydown');

    canvas.setBackgroundColor('darkblue');
    //Title at top
    var title = new fabric.Text('Select Your Character', {
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 60,
        fill: 'white',
        top: 20
    })
    canvas.sadd(title);
    title.centerH();

    var x = 200;
    for (let charName in views){
        let box = SelectBox(x, 550, 100, charName)
        canvas.sadd(box)
        selectBoxes.push(box);
        //Width of the box plus the stroke on both sides
        x += 110;

        let charDisplay = CharDisplay(0, 100, 400, 400, charName);
        canvas.sadd(charDisplay);
        charDisplays.push(charDisplay);

        let skillDisplay = SkillDisplay(400, 100, 600, 400, charName);
        canvas.sadd(skillDisplay);
        skillDisplays.push(skillDisplay);
    }
}

function SelectBox(x, y, length, charName){
    var square = new fabric.Rect({
        originX: 'center',
        originY: 'center',
        fill: 'green',
        stroke: 'gray',
        width: length,
        height: length,
        strokeWidth: length/20
    });

    var offset = 6;
    var char = views[charName].Sprite(0, 0, length/2-offset);
    char.set({originY:'center', originX:'center'});

    var box = new fabric.Group([square, char], {
        left:x,
        top:y
    });
    box.name = charName;
    return box;
};

function CharDisplay(x, y, width, height, charName){
    var rect = new fabric.Rect({
        width:width,
        height: height,
        stroke: 'white',
        strokeWidth: 2,
        originX: 'center',
        fill: ''
    });
    var name = new fabric.Textbox(charName, {
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 50,
        fill: 'white',
        top: 20,
        originX: 'center',
    });

    var char = views[charName].Sprite(0, name.getBoundingRectHeight()+30, height / 3);
    char.set({ originX: 'center' });
    return new fabric.Group([rect, char, name], {
        left:x,
        top:y,
    })
}

function SkillDisplay(x, y, width, height, charName){
    var rect = new fabric.Rect({
        width: width,
        height: height,
        stroke: 'white',
        strokeWidth: 2,
        originX: 'center',
        fill: ''
    });

    var skillText = new fabric.Textbox('Skills', {
        originX: 'center',
        textAlign: 'center',
        top: 20,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 50,
        fill: 'white'
    });

    var group = new fabric.Group([rect, skillText], {
        left:x,
        top: y,
        originX: 'left',
        originY: 'top'
    });

    let yoffset = skillText.getBoundingRectHeight() + 40;
    views[charName].skills.forEach(function (skill, i) {
        let desc = SkillDesc(0, i * 100, 100, 80, skill);
        desc.set({originX: 'left', originY: 'top'})
        group.add(desc);
    });
    group.addWithUpdate();

    return group;
}

//Assumes height < width, since icon will be square of length height
function SkillDesc(x, y, width, height, skill) {
    var icon = skill.Icon(0, 0, height);

    var xoffset = height + 30;
    var title = new fabric.Text(skill.name, {
        fontFamily: 'sans-serif',
        fontSize: 30,
        fill: 'white',
        left: xoffset,
        top: 0
    });

    var description = new fabric.Textbox(skill.description, {
        fontFamily: 'sans-serif',
        fontSize: 16,
        fill: 'white',
        left: xoffset,
        top: title.getBoundingRectHeight(),
        width: width - xoffset,
        height: height - title.getBoundingRectHeight()
    });

    return new fabric.Group([icon, title, description], {
        left: x,
        top: y
    })
}

module.exports = selectScreen;
},{"./allViews.js":1}],4:[function(require,module,exports){
function skillIconGenerator(charName, skillName) {
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

},{}],5:[function(require,module,exports){
var selectScreen = require('./selectScreen.js');

var socket = io('/room',  {transports: ['websocket'], upgrade: false});
socket.emit('roomId', roomId);
//Change issue handling later
socket.on('issue', function (issue) {
    console.log(issue);
});
socket.on('startGame', function () {
    console.log('startGame');
});

var canvas = new fabric.Canvas('gameScreen');
canvas.scale = function(object, scaleX, scaleY){
    object.left = object.left/object.scaleX * scaleX;
    object.top = object.top/object.scaleY * scaleY;
    object.scaleX = scaleX;
    object.scaleY = scaleY;
}
canvas.sadd = function(object){
    var scaleX = canvas.width / 1000;
    var scaleY = canvas.height / 700;
    this.scale(object, scaleX, scaleY);
    this.add(object);
}

selectScreen(canvas);
},{"./selectScreen.js":3}]},{},[5]);
