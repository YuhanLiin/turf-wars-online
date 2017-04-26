(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var views = require('../views/allViews.js');

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

    var char = views[charName].Sprite(0, name.getBoundingRectHeight()+height/3+35, height / 3);
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
        top: 0,
        left: 0,
        fill: ''
    });

    var skillText = new fabric.Textbox('Skills', {
        textAlign: 'center',
        top: 20,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 50,
        fill: 'white',
        width: width
    });

    var components = [rect, skillText];
    var yoffset = skillText.getBoundingRectHeight() + 35;
    views[charName].skills.forEach(function (skill, i) {
        let desc = SkillDesc(width/8, yoffset+i*height/5, width*3/4, 70, skill);
        components.push(desc);
    });

    return new fabric.Group(components, {
        left:x,
        top: y,
    });;
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

    var cdText = new fabric.Text('cooldown: '+skill.cooldown+' seconds', {
        fontFamily: 'sans-serif',
        fontSize: 16,
        fill: 'white',
        left: xoffset + title.getBoundingRectWidth() + 30,
        top: 10
    })

    var description = new fabric.Textbox(skill.description, {
        fontFamily: 'sans-serif',
        fontSize: 16,
        fill: 'white',
        left: xoffset,
        top: title.getBoundingRectHeight(),
        width: width - xoffset,
        height: height - title.getBoundingRectHeight()
    });

    return new fabric.Group([icon, title, cdText, description], {
        left: x,
        top: y,
        width: width,
        height: height
    })
}

module.exports.SkillDisplay = SkillDisplay;
module.exports.CharDisplay = CharDisplay;
},{"../views/allViews.js":5}],2:[function(require,module,exports){
var views = require('../views/allViews.js');

//Positioned around center
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

module.exports = SelectBox;
},{"../views/allViews.js":5}],3:[function(require,module,exports){
var display = require('./dataDisplay.js');
var SelectBox = require('./selectBox.js');
var views = require('../views/allViews.js');

//Changes canvas to the select screen
function selectScreen(canvas) {
    var selectBoxes = [];
    var charDisplays = [];
    var skillDisplays = [];
    var selected = 0;

    //Adds and renders dynamic content pertaining to selected character
    function render(){
        selectBoxes[selected].set('stroke', 'red');
        canvas.sadd(charDisplays[selected]);
        canvas.sadd(skillDisplays[selected]);
        canvas.renderAll();
    }

    //Removes dynamic content
    function remove(){
        selectBoxes[selected].set('stroke', 'gray');
        canvas.remove(charDisplays[selected]);
        canvas.remove(skillDisplays[selected]);
    }

    //Shifts character select to left and right with wrap around
    function selectLeft(){
        if (selected === 0) selected = selectBoxes.length-1;
        else selected -= 1;
    }
    function selectRight(){
        if (selected === selectBoxes.length-1) selected = 0;
        else selected += 1;
    }

    //Replace key handler
    $('*').off('keydown');
    $('*').keydown(function(e){
        var key = e.which;
        if (key === 37 || key === 39){
            e.preventDefault();
            remove();
            if (key === 37) selectLeft();
            else selectRight();
            render();
        }
    });

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
        let box = SelectBox(x, 570, 100, charName)
        selectBoxes.push(box);
        canvas.sadd(box);
        //Increment x by width of the box plus the stroke on both sides
        x += 110;

        let charDisplay = display.CharDisplay(0, 100, 400, 450, charName);
        charDisplays.push(charDisplay);

        let skillDisplay = display.SkillDisplay(400, 100, 600, 450, charName);
        skillDisplays.push(skillDisplay);
    }
    render();
}

module.exports = selectScreen;
},{"../views/allViews.js":5,"./dataDisplay.js":1,"./selectBox.js":2}],4:[function(require,module,exports){
var selectScreen = require('./selectScreen/selectScreen.js');

var socket = io('/room',  {transports: ['websocket'], upgrade: false});
socket.emit('roomId', roomId);
//Change issue handling later
socket.on('issue', function (issue) {
    console.log(issue);
});
socket.on('startGame', function () {
    console.log('startGame');
});

var canvas = new fabric.Canvas('gameScreen', {renderOnAddRemove: false});
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
},{"./selectScreen/selectScreen.js":3}],5:[function(require,module,exports){
var SlasherView = require('./characters/slasherView.js');
var IconGen = require('./skillIcon.js');

var descriptions = {
    'Cut': "Quick melee attack that hits right in front of you.",
    'Dash': "Move a short distance in any of the 8 cardinal directions.",
    'Dodge': "Evade all attacks for an instant.",
    'Vortex': "Become invinsible and slice up everything around you for the next 4 seconds."
}

function skillViewModel(name, description, cooldown){
    return {
        name: name,
        description: description,
        cooldown: cooldown,
        Icon: IconGen(name)
    };
}

module.exports.Slasher = {
    Sprite: SlasherView,
    skills: [
        skillViewModel('Cut', 'Quick melee attack that hits right in front of you.', '0.5'),
        skillViewModel('Dash', 'Move a short distance in any of the 8 cardinal directions.', '2'),
        skillViewModel('Dodge', 'Evade all attacks for an instant.', '3.5'),
        skillViewModel('Vortex', 'Become invinsible and slice up everything around you for the next 4 seconds.', '15'),
    ]
};
},{"./characters/slasherView.js":6,"./skillIcon.js":7}],6:[function(require,module,exports){
//Method for syncing view with character state
function updateMethod(character){
    this.set({left: character.posx, top: character.posy});
}

//How Slasher is displayed (3 circles)
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

    var view = new fabric.Group([outer, middle, inner], {
        left: x,
        top: y,
        originX: 'center',
        originY: 'center'
    });
    view.update = updateMethod;
    return view;
}

module.exports = SlasherView;
},{}],7:[function(require,module,exports){
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

},{}]},{},[4]);