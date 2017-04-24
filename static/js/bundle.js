(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

module.exports = {'Slasher': SlasherView};
},{}],2:[function(require,module,exports){
var charViews = require('./charView.js');

var selectBoxes = [];
var charDisplays = [];
var skillDisplays = [];
var selected = 0;

function selectScreen(canvas, ratio) {
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
    for (let charName in charViews){
        let box = SelectBox(x, 550, 100, charName)
        canvas.sadd(box)
        selectBoxes.push(box);

        let charDisplay = CharDisplay(0, 100, 400, 400, charName);
        canvas.sadd(charDisplay);
        charDisplays.push(charDisplay);

        let skillDisplay = SkillDisplay(400, 100, 600, 400, charName);
        canvas.sadd(skillDisplay);
        skillDisplays.push(skillDisplay);
        x += 100;
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
        strokeWidth: 5
    });

    var offset = 6;
    var char = charViews[charName](0, 0, length/2-offset);
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
        height:height,
        stroke: 'black',
        originX: 'center',
        originY: 'center',
        fill: ''
    });
    var name = new fabric.Text(charName, {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 50,
        fill: 'white',
        originX: 'center',
        originY: 'bottom',
        top:-height*2/7
    });
    var yoffset = 30;
    var char = charViews[charName](0, yoffset, height/3);
    char.set({originY:'center', originX:'center'});
    return new fabric.Group([rect, char, name], {
        left:x,
        top:y,
        width:width,
        height:height
    })
}

function SkillDisplay(x, y, width, height, charName){
    var rect = new fabric.Rect({
        width:width,
        height:height,
        stroke: 'black',
        originX: 'center',
        originY: 'center',
        fill: ''
    });
    var skillText = new fabric.Text('Skills', {
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 50,
        fill: 'white'
    });
    return new fabric.Group([rect, skillText], {
        left:x,
        top:y,
        width:width,
        height:height
    });
}

module.exports = selectScreen;
},{"./charView.js":1}],3:[function(require,module,exports){
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

var canvas = new fabric.StaticCanvas('gameScreen');
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
},{"./selectScreen.js":2}]},{},[3]);
