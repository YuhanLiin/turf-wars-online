(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Input = require('../game/input.js');
var Game = require('../game/game.js');

var game;

function createGame(state, gameMap, socket) {
    function updateGame(tick) {
        //if (game.frameCount < 150 ) console.log(game)
        state.updateViewFunctions.forEach(update=>update());
        //If the page is hidden from view then run updates in background
        if (document.hidden) setTimeout(tick);
        //Otherwise render normally
        else {
            state.canvas.srenderAll();
            fabric.util.requestAnimFrame(tick);
        }
    }

    function handleGameUpdates(topic, player, message){
        if (topic === 'update'){
            if (player === 'you') socket.emit('input', message);
        }
        //else this.isDone = false;
    }

    Game.inject(updateGame, handleGameUpdates);

    //Clear other inputs
    state.playerControls.clear();
    //Set up game
    var inputs = { 'you': state.playerControls.makeInputManager(), 'other': Input() };

    socket.on('oUpdate', function(input){
        inputs.other.process(input);
    });

    game = Game(gameMap, inputs);

    return game;
}

//End the continuous running of the game
function endGame(){
    if (game) {
        game.isDone = true;
    }
}

module.exports.createGame = createGame;
module.exports.endGame = endGame;
},{"../game/game.js":25,"../game/input.js":27}],2:[function(require,module,exports){
//Use this canvas for rest of the game and configure it with methods
var canvas = new fabric.StaticCanvas('gameScreen', { renderOnAddRemove: false });

canvas.realGroups = [];

//Scale an object's position and size according to factors
canvas.sresize = function (object, scaleX, scaleY) {
    object.left = object.left / object.scaleX * scaleX;
    object.top = object.top / object.scaleY * scaleY;
    object.scaleX = scaleX;
    object.scaleY = scaleY;
}

//Scale all current objects
//Now all entities can be assumed to be on 1000x700 canvas
canvas.sresizeAll = function (){
    var scaleX = canvas.width / 1000;
    var scaleY = canvas.height / 700;
    var self = this;
    self.getObjects().forEach(function(item){
        self.sresize(item, scaleX, scaleY);
    });
}

canvas.sadd = function (object) {
    this.add(object);
}

//Add all entities in a real group
canvas.saddGroup = function (realGroup) {
    var self = this;
    realGroup.components.forEach(item=>self.sadd(item));
    this.realGroups.push(realGroup);
}

//Render all entities with realgroup offsets in mind
canvas.srenderAll = function (realGroup) {
    //Apply realGroup offsets
    this.realGroups.forEach(group=>group.offsetAll());
    //Apply canvas scale resize
    this.sresizeAll();
    this.renderAll();
}

module.exports = canvas;

},{}],3:[function(require,module,exports){
var Input = require('../game/input.js');

//Input manager used by client player, which has no queue
function KeyInput() {
    var manager = Object.create(KeyInput.prototype);  
    //Instead of queue store a flat input record to be edited by keyboard inputs
    manager._vert = 0;
    manager._hori = 0;
    manager._skill = 0;
    return manager;
}

var ymap = { 'u': -1, 'd': 1 };
var xmap = { 'l': -1, 'r': 1 };

 //Key handler for key down (editing input)
function downHandler(input) {
    switch (input) {
        case 'u':
        case 'd':
            this._vert = ymap[input];
            break;
        case 'l':
        case 'r':
            this._hori = xmap[input];
            break;
        case 1:
        case 2:
        case 3:
        case 4:
            this._skill = input;
            break;
    }
}

//Key handler for key up (zeroing input)
function upHandler (input) {
    switch (input) {
        case 'u':
        case 'd':
            if (this._vert === ymap[input]) this._vert = 0;
            break;
        case 'l':
        case 'r':
            if (this._hori === xmap[input]) this._hori = 0;
            break;
        case 1:
        case 2:
        case 3:
        case 4:
            if (this._skill === input) this._skill = 0;
            break;
    }
}

KeyInput.prototype = {
    //Never empty
    isEmpty() {
        return false;
    },
    //No need to clear due to lack of queue
    clear() {},

    get() {
        return [this._vert, this._hori, this._skill];
    },

    

    //General API methods are repeated
    pack: Input.prototype.pack,
    unpack: Input.prototype.unpack
}

//Convert keycode to game inputCode via one set of controls
function Controls() {
    //Maps keydown keycodes to the type of input. Defaults to WASD for UDLR and HJKL for the 4 skills
    var keyMap = { '87': 'u', '83': 'd', '65': 'l', '68': 'r', '72': 1, '74': 2, '75': 3, '76': 4, '13': 'enter' };
    return {
        //Turns an input handler into a mapped key handler and hook it to keydown or keyup
        registerHandler(type, inputHandler) {
            $('body').on('key' + type, function (e) {
                e.preventDefault();
                var input = keyMap[e.which.toString()];
                return inputHandler(input);
            });
        },
        //Create the above input manager with all events registered
        makeInputManager() {
            var manager = KeyInput();
            this.registerHandler('down', input=>downHandler.call(manager, input));
            this.registerHandler('up', input=>upHandler.call(manager, input));
            return manager;
        },

        clear() {
            $('body').off('keyup');
            $('body').off('keydown');
        }
    };
}

module.exports = Controls;

},{"../game/input.js":27}],4:[function(require,module,exports){
var Hud = require('./playerHud.js');
var Turf = require('./turf.js');

var playerHudColour = { 'you': 'white', 'other': 'red' };

function gameScreen(state, game) {
    //Reset the canvas but don't touch the controls since they are already configured
    state.reset();
    state.canvas.setBackgroundColor('darkblue');
    //Make the HUD sidebar for each player
    var huds = [];
    for (let player in game.characters) {
        let char = game.characters[player];
        //Sidebar positions depend on where player starts
        if (char.posx < 350) {
            huds.push(Hud(50, 10, 100, 700, player, char, playerHudColour[player], 0, 200));
        }
        else {
            huds.push(Hud(950, 10, 100, 700, player, char, playerHudColour[player], 500, 40));
        }
    }
    
    var turf = Turf(100, 0, game);
    //Add groups to canvas
    state.canvas.saddGroup(turf);
    state.canvas.sadd(huds[0]);
    state.canvas.sadd(huds[1]);
    state.canvas.srenderAll();

    state.updateViewFunctions.push(turf.update, huds[0].update, huds[1].update);
    game.start();
}

module.exports = gameScreen;
},{"./playerHud.js":5,"./turf.js":6}],5:[function(require,module,exports){
var views = require('../views/allViews.js');
var capitalize = fabric.util.string.capitalize;

//HUD part with player name and character sprite
function Header(x, y, width, height, playerName, char, textColor){
    var nameText = new fabric.Textbox(capitalize(playerName), {
        textAlign: 'center',
        originX: 'center',
        width: width,
        top: 10,
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 36,
        fill: textColor
    });
    var charView = views[char.name].Sprite(0, height*2 / 3, width / 2 - 5);
    return new fabric.Group([charView, nameText],{
        left: x, top: y,
        originX: 'center', originY: 'top'
    });
}

//Sidebar HUD that displays the character and skills owned by one player
//headerStart and iconStart customizes the positions of the player header and skill icons
function Hud(x, y, width, height, playerName, char, textColor, headerStart, iconStart) {
    //Put header at top
    var header = Header(0, headerStart, width, height * 2 / 7, playerName, char, textColor);
    //Blue background
    var bg = new fabric.Rect({left:0, top:0, width:width, height:height, fill:'', originX: 'center', originY: 'top', fill:'darkblue'});

    //Generate skill icons vertically and bind them to character skills
     var components = views[char.name].skills.map(function (skill, i) {
        var icon = skill.Icon(0, iconStart, height / 9);
        icon.set({ originX: 'center', originY: 'top' });

        //Bind icons to character skill models
        icon.bind(char.skills[i]);
        iconStart += height / 6;
        return icon;
     });

    components.unshift(bg, header);
    var group = new fabric.Group(components, {
        left: x,
        top: y,
        //Positioned by center of x and top of y
        originX: 'center',
        originY: 'top',
        height: height
    });

    //Update all skillIcons; skip the header and background at beginning
    function update() {
        group.getObjects().forEach(function (component, i) {
            if (i > 1) component.update();
        });
    }
    group.update = update;
    return group;
}
module.exports = Hud;
},{"../views/allViews.js":14}],6:[function(require,module,exports){
var views = require('../views/allViews.js');
var RealGroup = require('../realGroup.js');

//Assumed to be same size as game board. Components all have bindings to game entities and will update when drawn
function Turf(x, y, game) {
    var turf = new fabric.Rect({
        left: 0,
        top: 0,
        width: game.width,
        height: game.height,
        originX: 'left', originY: 'top',
        fill: 'green'
    });

    var components = [turf];
    console.log(views)
    //For each character and skill in game bind to a component view
    Object.keys(game.characters).forEach(function(player){
        var character = game.characters[player];
        //Bind character to view
        components.push(views[character.name].Sprite(100, 100, character.radius)
            .bind(character));
        views[character.name].skills.forEach(function(skill, i){
            //Bind each skill to views
            components.push(skill.Sprite().bind(character.skills[i]));
        })
    });

    var group = RealGroup(components, x, y);

    //Call update on all components other than the green backdrop
    function update() {
        group.components.forEach(function (view, i) {
            if (i !== 0) {
                view.update();
            }
            else {
                view.set({ left: 0, top: 0 })
            }
        });
    }

    group.update = update;
    group.update();
    return group; 
}



module.exports = Turf;
},{"../realGroup.js":7,"../views/allViews.js":14}],7:[function(require,module,exports){
//Fabricjs groups make no sense, so i use this instead
function RealGroup(components, x, y){
    var group = Object.create(RealGroup.prototype);
    group.left = x;
    group.top = y;
    group.components = components;
    return group;
}

RealGroup.prototype = {
    add(item){
        this.components.push(item);
    },
    //Apply realGroup offsets. Assume position of object has already been reset with default scaling in mind
    offsetAll(){
        var self = this;
        this.components.forEach(function(item){
            item.set({left: item.left+self.left, top: item.top+self.top, scaleX: 1, scaleY: 1});
        });
    },
}

module.exports = RealGroup;
},{}],8:[function(require,module,exports){
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
},{"../views/allViews.js":14}],9:[function(require,module,exports){
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
    return box;
};

module.exports = SelectBox;
},{"../views/allViews.js":14}],10:[function(require,module,exports){
var display = require('./dataDisplay.js');
var SelectBox = require('./selectBox.js');
var views = require('../views/allViews.js');

//Changes state.canvas to the select screen
function selectScreen(state) {
    //Stores dynamic components corresponding to each character so they can be switched around for different selected chars
    var selectBoxes = [];
    var charDisplays = [];
    var skillDisplays = [];
    var charNames = [];
    var selected = 0;

    //Adds and renders dynamic content pertaining to selected character 
    function render(){
        selectBoxes[selected].set('stroke', 'red');
        state.canvas.sadd(charDisplays[selected]);
        state.canvas.sadd(skillDisplays[selected]);
        state.canvas.srenderAll();
    }

    //Removes dynamic content
    function remove(){
        selectBoxes[selected].set('stroke', 'gray');
        state.canvas.remove(charDisplays[selected]);
        state.canvas.remove(skillDisplays[selected]);
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

    
    state.reset();
    state.playerControls.clear();
    state.canvas.setBackgroundColor('darkblue');
    state.playerControls.registerHandler('up', function(input) {
        if (input === 'l' || input === 'r') {
            remove();
            if (input === 'l') selectLeft();
            else selectRight();
            render();
        }
        else if (input === 'enter'){
            var name = charNames[selected];
            state.selectedChar = name;
        }
    })

    //Title at top
    var title = new fabric.Text('Select Your Character', {
        textAlign: 'center',
        originX: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 60,
        fill: 'white',
        top: 20,
        left: 500
    })
    state.canvas.sadd(title);

    //Create character select boxes, character and skill displays for all available characters
    var x = 200;
    for (let charName in views){
        let box = SelectBox(x, 570, 100, charName)
        selectBoxes.push(box);
        state.canvas.sadd(box);
        //Increment x by width of the box plus the stroke on both sides
        x += 110;

        let charDisplay = display.CharDisplay(0, 100, 400, 450, charName);
        charDisplays.push(charDisplay);

        let skillDisplay = display.SkillDisplay(400, 100, 600, 450, charName);
        skillDisplays.push(skillDisplay);

        charNames.push(charName);
    }
    render();
}

module.exports = selectScreen;
},{"../views/allViews.js":14,"./dataDisplay.js":8,"./selectBox.js":9}],11:[function(require,module,exports){
var selectScreen = require('./selectScreen/selectScreen.js');
var gameScreen = require('./gameScreen/gameScreen.js');
var loadScreen = require('./staticScreens/loadScreen.js');
var endScreen = require('./staticScreens/endScreen.js');
var canvas = require('./canvas.js');
var Controls = require('./controls.js')
var boot = require('./bootstrapper.js');

//Websockets only
var socket = io('/room',  {transports: ['websocket'], upgrade: false});
//Consists of waitPlayer, select, waitSelect, game, end
var curScreen = '';

//State accessed by each screen
var state = {
    updateViewFunctions: [],
    canvas: canvas, 
    selectedChar: null,
    playerControls: Controls(),
    //The ID of the animation interval used by loading screen
    intervalId: null,
    reset() {
        this.canvas.clear();
        this.canvas.realGroups = [];
        //Stop current loading screen animation
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
}

socket.emit('roomId', roomId);
//Log all issues
socket.on('issue', function (issue) {
    console.log(issue);
});

//If opponent disconnects, show conclusion screen and set the screen state accordingly
socket.on('disconnectWin', function(){
    end();
    endScreen(state, 'win', 'since the other guy disconnected');
})

//Set up conditions for ending screen from any screen. Makes sure endscreen cannot transition to anything else
function end(){
    curScreen = 'end';
    //Clear all event handlers
    socket.off('startGame');
    socket.off('startMatch');
    socket.off('disconnectWin');
    socket.off('lose');
    socket.off('win');
    socket.off('draw');
    socket.off('oUpdate');
    //End currently running game
    boot.endGame();
    //Clear control handlers
    state.playerControls.clear();
}

//Modifies the curScreen variable and shows the next screen on canvas. Removes old socket listeners and put on new ones
function nextScreen(...args){
    switch(curScreen){
        //Before the first call. This will initialize handlers for first loading screen
        case '':
            curScreen = 'waitPlayer';
            //1st load screen
            loadScreen(state, 'Waiting for player to join');
            //Go to next screen after receiving notif
            socket.on('startGame', function(){
                nextScreen();
            });
            break;

        //Waiting for other player to join
        case 'waitPlayer':
            curScreen = 'select';
            //Clear handler from previous screen
            socket.off('startGame');
            selectScreen(state);
            //If enter button is pressed then proceed to next screen
            state.playerControls.registerHandler('up', function(input){
                if (input === 'enter') nextScreen(state.selectedChar);
            })
            break;

        //Character select
        case 'select':
            //Receive character name as param
            var character = args[0];
            curScreen = 'waitSelect';
            //2nd load screen and wait for both players to pick character
            loadScreen(state, 'Waiting for opponent');
            socket.on('startMatch', function(gameMap){
                nextScreen(gameMap);
            });
            //Tell server of character choice
            socket.emit('selectChar', character);
            break;

        //Waiting for both players to pick
        case 'waitSelect':
            //Receive game initialization data as param
            var gameMap = args[0];
            curScreen = 'game';
            socket.off('startMatch');
            //Start the game and game UI. Game bootstrapper will handle the socket calls
            gameScreen(state, boot.createGame(state, gameMap, socket));
            //TODO handle game result and go on to result screen
            break;

        case 'game':
            //TODO
            break;

        default:
            console.log('WTF');
    }
}
nextScreen();

//endScreen(state, 'win', 'LOLWTF')
//selectScreen(state);
//gameScreen(state, boot(state, [['you','Slasher'], ['other','Slasher']]));
//loadScreen(state, 'Loading');
},{"./bootstrapper.js":1,"./canvas.js":2,"./controls.js":3,"./gameScreen/gameScreen.js":4,"./selectScreen/selectScreen.js":10,"./staticScreens/endScreen.js":12,"./staticScreens/loadScreen.js":13}],12:[function(require,module,exports){
var colorMapping = {'win': 'purple', 'lose': 'red', 'draw': 'blue'};

//Screen marking end of the match
//Result is win, lose, or draw
function endScreen(state, result, text){
    state.reset();
    state.playerControls.clear();
    console.log(colorMapping[result])
    state.canvas.setBackgroundColor(colorMapping[result]);

    var titleDisplay = new fabric.Text(('You '+result+'!!!').toUpperCase(), {
        fill: 'white',
        originX: 'center',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 100,
        top: 300,
        left: 500
    });

    var textDisplay = new fabric.Text(text, {
        fill: 'white',
        originX: 'center',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 40,
        top: titleDisplay.getBoundingRectHeight() + titleDisplay.top + 30,
        left: 500
    });

    state.canvas.sadd(titleDisplay);
    state.canvas.sadd(textDisplay);
    state.canvas.srenderAll();
}

module.exports = endScreen;
},{}],13:[function(require,module,exports){
function loadScreen(state, text) {
    state.reset();
    state.playerControls.clear();
    state.canvas.setBackgroundColor('gray');
    //Display input text in middle of screen
    var txtDisplay = new fabric.Text(text, {
        fill: 'white',
        originX: 'center',
        textAlign: 'center',
        fontFamily: 'sans-serif',
        fontWeight: 'bold',
        fontSize: 60,
        top: 350,
        left: 500
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
},{}],14:[function(require,module,exports){
var SlasherView = require('./characters/slasherView.js');
var CutView = require('./skills/Slasher/cutView.js');
var DashView = require('./skills/Slasher/dashView.js');
var DodgeView = require('./skills/Slasher/dodgeView.js');
var VortexView = require('./skills/Slasher/vortexView.js');

var IconGen = require('./skillIcon.js');

var descriptions = {
    'Cut': "Quick melee attack that hits right in front of you.",
    'Dash': "Move a short distance in any of the 8 cardinal directions.",
    'Dodge': "Evade all attacks for an instant.",
    'Vortex': "Become invinsible and slice up everything around you for the next 4 seconds."
}

function skillViewModel(name, description, cooldown, skillView){
    return {
        name: name,
        description: description,
        cooldown: cooldown,
        Icon: IconGen(name),
        Sprite: skillView
    };
}

module.exports.Slasher = {
    Sprite: SlasherView,
    skills: [
        skillViewModel('Cut', 'Quick melee attack that hits right in front of you.', '0.5', CutView),
        skillViewModel('Dash', 'Move a short distance in any of the 8 cardinal directions.', '2', DashView),
        skillViewModel('Dodge', 'Evade all attacks for an instant.', '3.5', DodgeView),
        skillViewModel('Vortex', 'Become invinsible and slice up everything around you for the next 4 seconds.', '15', VortexView),
    ]
};
},{"./characters/slasherView.js":16,"./skillIcon.js":17,"./skills/Slasher/cutView.js":18,"./skills/Slasher/dashView.js":19,"./skills/Slasher/dodgeView.js":20,"./skills/Slasher/vortexView.js":21}],15:[function(require,module,exports){
//Contains the method used by every view to bind a game model to itself
//Exposed this.model
module.exports = function(model){
    this.model = model;
    //Allow call chaining
    return this;
}
},{}],16:[function(require,module,exports){
var bind = require('../bind.js');

//Method for syncing view with character state
function updateMethod(){
    this.setLeft(this.model.posx);
    this.setTop(this.model.posy);
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
    view.bind = bind;
    return view;
}

module.exports = SlasherView;
},{"../bind.js":15}],17:[function(require,module,exports){
var bind = require('./bind.js');

//Change height of filter based on how much of the cooldown has passed
function update() {
    var skill = this.model;
    var ratio = skill.curCooldown / skill.cooldown;
    this.filter.set('height', ratio*this.height);
}

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
        var icon = new fabric.Rect({
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

        //Filter for cooldowns. Begins at 0 height
        var filter = new fabric.Rect({
            originX: 'center',
            originY: 'bottom',
            top: length/2,
            width: length,
            height: 0,
            fill: 'lightblue',
            opacity: 0.7
        });

        var group = new fabric.Group([border, icon, letter, filter], {
            left: x,
            top: y,
            width: length,
            height: length
        });
        group.filter = filter;
        group.bind = bind;
        group.update = update;
        group.model = null;
        return group;
    }
}

module.exports = skillIconGenerator;

},{"./bind.js":15}],18:[function(require,module,exports){
var skillView = require('../skillView.js')

//Draw out the cut attack as long as it is active
function _update(){
    var atk = this.model.attack;
    if (atk.curFrame > 0){
        this.set({
            left: atk.posx,
            top: atk.posy,
            opacity: 1
        });
    }
    else{
        this.setOpacity(0);
    }
}

//Should probably show a sprite. Right now just shows a circle
//Origin is at center
function CutView() {
    var view = Object.assign(new fabric.Circle({
        radius: 20,
        fill: 'red',
        opacity: 0,
        originX: 'center',
        originY: 'center'
    }), skillView);
    view._update = _update;
    return view;
}

module.exports = CutView;
},{"../skillView.js":22}],19:[function(require,module,exports){
var skillView = require('../skillView.js')

module.exports = function(){
    return Object.assign(new fabric.Rect({fill: ''}), skillView);
}
},{"../skillView.js":22}],20:[function(require,module,exports){
var skillView = require('../skillView.js')

function _update(){
    var skill = this.model;
    this.set({left: skill.character.posx, top: skill.character.posy});
    //Have it blink once every 2 frames
    if (skill.curFrame/2 % 2 != 0){
        this.setOpacity(0.5);
    }
    else{
        this.setOpacity(0);
    }
}

//An overlay for the character, origin in center
function DodgeView(){
    var view = Object.assign(new fabric.Circle({
        radius: 20,
        fill: 'white',
        originX: 'center',
        originY: 'center'
    }), skillView);
    view._update = _update;
    return view;
}

module.exports = DodgeView;
},{"../skillView.js":22}],21:[function(require,module,exports){
var skillView = require('../skillView.js')

function _update(){
    var skill = this.model;
    var [circle, outerLining, innerLining, bar] = this.getObjects();
    //Center view onto character and make it visible
    this.set({left: skill.character.posx, top: skill.character.posy});

    //On first 10 frames have the circle expand into the size of character
    if (skill.curFrame <= 10){
        circle.setRadius(20*skill.curFrame/10);
    }
    //On last 10 frames turn off all components except the circle, which shrinks into 0
    else if (skill.curFrame >= skill.endFrame-10){
        outerLining.setOpacity(0);
        innerLining.setOpacity(0);
        bar.setOpacity(0);
        var framesLeft = skill.endFrame - skill.curFrame;
        circle.setRadius(20*framesLeft/10)
    }
    //On active frames make the gray circle larger and put 2 black rings in it
    else{
        outerLining.setOpacity(1);
        innerLining.setOpacity(1);
        bar.setOpacity(1);
        circle.setRadius(35);
        //Change orientation of the gray bar every 3 frames to make it look like spinning
        if (this._spinState <= 3) bar.set({width:20, height:60});
        else bar.set({width:60, height:20});
    }

    this._spinState++;
    if (this._spinState > 6) this._spinState = 1;
}

function VortexView (){
    var circle = new fabric.Circle({
        originX: 'center',
        originY: 'center',
        top: 0,
        left: 0,
        radius: 0,
        fill: 'gray',
    });
    var outerLining = new fabric.Circle({
        originX: 'center',
        originY: 'center',
        top: 0,
        left: 0,
        radius: 27,
        fill: '',
        stroke: 'black',
    });
    var innerLining = outerLining.clone();
    innerLining.setRadius(15);
    var bar = new fabric.Rect({
        originX: 'center',
        originY: 'center',
        top: 0,
        left: 0,
        fill: 'gray'
    });

    var view = Object.assign(new fabric.Group([circle, outerLining, innerLining, bar], {
        originY: 'center', originX: 'center',
        width: 80, height: 80
    }), skillView);
    view._spinState = 1;
    view._update = _update;
    return view;
}

module.exports = VortexView;
},{"../skillView.js":22}],22:[function(require,module,exports){
var bind = require('../bind.js');

//Mixin for all skills
module.exports = {
    update(){
        var skill = this.model;
        //Set opacity to full whenever skill is active
        if (skill.curFrame > 0){
            this.setOpacity(1);
            this._update();
        }
        //Automatically turn off nonactive skill views
        else this.setOpacity(0);
    },

    bind: bind,

    //If not inherited, this will do nothing
    _update(){}
};
},{"../bind.js":15}],23:[function(require,module,exports){
var oneroot2 = 1 / Math.sqrt(2);

function Character(game, px, py, dx, dy) {
    var char = Object.create(Character.prototype);
    char.game = game;
    //Position on screen
    char.posx = px;
    char.posy = py;
    char.facex;
    char.facey;
    char.canTurn = true;
    //Turn the player to initial direction but disable movement
    char.turn(dx, dy);
    char.isMoving = false;
    //Turned off when a skill is active
    char.canAct = true;
    char.isAlive = true;
    char.isInvincible = false;
    char.attackList = [];
    char.projectileList = [];
    return char;
}
//Excluded baseSpeed, frameSpeed, and skills, a 4 element Skill array

//All characters will share this prototype
Character.prototype = {
    radius: 20,
    //Used to initialize speed
    setSpeed(speed){
        this.baseSpeed = speed;
        this.frameSpeed = speed;
    },

    move (){
        if (!this.isMoving) return;
        var dist = this.frameSpeed;
        this.posx += Math.round(dist*this.facex);
        this.posy += Math.round(dist*this.facey);
        //Bounds checking
        if (this.posx < this.radius) this.posx = this.radius;
        if (this.posy < this.radius) this.posy = this.radius;
        if (this.posx > this.game.width - this.radius) this.posx = this.game.width - this.radius;
        if (this.posy > this.game.height - this.radius) this.posy = this.game.height - this.radius;
    },

    //Determines player's facing values based on directional input.
    turn (dirx, diry) {
        //No movement input means character stops moving but faces same direction
        if (!dirx && !diry) this.isMoving = false;
        else {
            this.isMoving = true;
            //Character cant turn but can still move
            if (!this.canTurn) return;
            //Diagonal facing means both x and y are set but factors are scaled down according to Pythagoreas
            if (dirx && diry) {               
                this.facex = dirx * oneroot2;
                this.facey = diry * oneroot2;
            }
            else {
                this.facex = dirx;
                this.facey = diry;
            }
        }
    },

    processProjectiles(){
        for (let i=0; i<this.projectileList.length; i++){
            var proj = this.projectileList[i];
            //Move projectile every frame and remove those that have reached end of lifetime
            if (proj.isDone()){
                this.projectileList.splice(i, 1);
                i--;
            }
            proj.move();
        }
    },

    receiveInput(dirx, diry, skillNum){
        this.turn (dirx, diry);
        var skillUsed = false;      
        if (skillNum) skillUsed = this.skills[skillNum-1].use();
    },

    //Takes user input and runs all of character's processing for one frame. Returns whether a skill was used or not
    frameProcess(){        
        //Propagates frame process
        for (let i=0; i<this.skills.length; i++){
            this.skills[i].frameProcess();
        }
        this.move();
        this.processProjectiles();
    }
};

module.exports = Character;
},{}],24:[function(require,module,exports){
var Character = require('./character.js');
var Cut = require('../skills/Slasher/cut.js');
var Dash = require('../skills/Slasher/dash.js');
var Dodge = require('../skills/Slasher/dodge.js');
var Vortex = require('../skills/Slasher/vortex.js');
var skillFactories = [Cut, Dash, Dodge, Vortex];

function Slasher(...args) {
    var char = Character.apply(undefined, args);
    char.setSpeed(7);
    char.name = 'Slasher';
    char.skills = skillFactories.map(factory=>factory(char, char.attackList, char.projectileList));
    return char;
}

module.exports = Slasher;
},{"../skills/Slasher/cut.js":28,"../skills/Slasher/dash.js":29,"../skills/Slasher/dodge.js":30,"../skills/Slasher/vortex.js":31,"./character.js":23}],25:[function(require,module,exports){
//Responsible for input, output, and game loop; characterMap maps playerId to character name; inputJson maps inputManagers to character name
function Game(characterMap, inputJson){
    var game = Object.create(Game.prototype);
    game.isDone = false;
    game.frameCount = 0;
    //Maps players to their characters and input managers
    game.characters = {};
    game.inputs = inputJson;
    //Player1 starts top right, player 2 starts bottom left
    var startPositions = [{px: 40, py: 40, dx: 1, dy: 1}, {px: game.width-40, py: game.height-40, dx: -1, dy: -1}]
    characterMap.forEach(function (pair) {
        let player = pair[0];
        let charName = pair[1];
        //Populates players object
        let args = startPositions.pop();
        //Constructs character models and their positions on the map
        game.characters[player] = Game.roster[charName](game, args.px, args.py, args.dx, args.dy);
    });
    return game;
}

Game.frameTime = 1000/30;
//Max # of frames that can be processed every run(), to prevent accumulating delta time
Game.maxTickFrames = 50;
//Max amount of time to wait for a user input before considering the user to be disconnected
Game.maxWaitTime = 200;
//Available characters
Game.roster = {Slasher: require('./characters/slasher.js')};

//Inject 2 dependencies that differ between client and server
//Next tick schedules the next tick of the game, sendUpdates sends game state to client/server
Game.inject = function (nextTick, sendUpdate) {
    Game.prototype = {
        nextTick: nextTick,
        sendUpdate: sendUpdate,

        //Size of game field
        height: 700,
        width: 800,

        //Starts the game loop. Run once per game
        start() {
            var then = Date.now();
            var delta = 0;
            var self = this;
            
            //Check if inputs from all players are available. Returns whether to let the next frame run 
            function checkInputs(){
                for (let id in self.inputs){
                    let input = self.inputs[id];
                    //If a player's input isnt there dont let frame run
                    if (input.isEmpty()){
                        //If the wait time has exceeded the max then delta then let the next frame run (desync with client)
                        if (delta > Game.maxWaitTime){
                            return true;
                        }
                        return false;
                    }
                }
                return true;
            }

            //Computes each tick of game loop
            function tick() {
                var now = Date.now();
                //Accumulate delta to account for remainder from last frame
                delta += now - then;
                then = now;
                //For every single frame that should have passed between this tick and the last
                for (let tickFrames = 0; delta >= Game.frameTime; delta -= Game.frameTime, tickFrames++) {
                    //Once game is over stop consuming CPU time
                    if (self.isDone) return;
                    //If no inputs then skip to next tick
                    if (!checkInputs()) break;
                    //Update game state and stop game loop if game is done
                    self.frame();
                    //If the number of frames per tick is too high, discard the remaining frames and clear all inputs
                    if (tickFrames >= Game.maxTickFrames) {
                        delta = 0;
                        //Should probably send corrective state
                        Object.values(self.inputs).forEach(input=>input.clear());
                        console.log('frame dump')
                    }
                }
                //Propagate to the next tick to gather more delta
                self.nextTick(tick);
            }
            tick();
        },

        //Code that runs every frame. Updates game state by checking input records
        frame() {
            this.frameCount++;
            //Update the characteristics of each character according to the input
            for (let player in this.characters) {
                let char = this.characters[player];
                let input = this.inputs[player];
                let [diry, dirx, skillNum] = input.get();
                //Only process inputs if input queue isnt empty
                if (dirx !== undefined) {
                    char.receiveInput(dirx, diry, skillNum);
                    //Stream the player's input if there is any
                    sendUpdate('update', player, input.pack(diry, dirx, skillNum))
                }
                char.frameProcess();
                char.attackList.forEach(hitbox=>this.checkAllHits(hitbox, player));
                char.projectileList.forEach(hitbox=>this.checkAllHits(hitbox, player));
            }
            this.checkVictory();
        },

        checkAllHits(hitbox, playerId){
            //Inactive hitboxes are skipped. Active hitboxes are checked against opponent
            if (hitbox.curFrame === 0) return;
            for (let id in this.characters){
                if (id !== playerId){
                    hitbox.checkHit(this.characters[id]);
                }
            }
        },

        checkVictory(){
            var alivePlayer, alivePlayerCount = 0;
            //Loop thru players and count the ones that are alive
            for (let playerId in this.characters){
                let char = this.characters[playerId];
                if (char.isAlive){
                    alivePlayerCount++;
                    alivePlayer = playerId;
                }
            }
            //End the game if last man standing or everyone's down
            if (alivePlayerCount <= 1){
                for (let playerId in this.characters){
                    if (playerId === alivePlayer){
                        sendUpdate('win', playerId);
                    }
                    //Dead players lose if someone else is alive; draw if everyone is down
                    else{
                        if (alivePlayerCount === 1) sendUpdate('lose', playerId);
                        else sendUpdate('draw', playerId);
                    }
                }
                this.isDone = true;
            }
        }
    };
};

module.exports = Game;
},{"./characters/slasher.js":24}],26:[function(require,module,exports){
//Server and client side code. Server will get real hitbox mixin, client mixin will do nothing
var hitboxMixin = {
    checkHit (otherBox) {
        var deltax = this.posx - otherBox.posx;
        var deltay = this.posy - otherBox.posy;
        var dist = Math.sqrt(deltax * deltax + deltay * deltay);
        if (dist < this.radius + otherBox.radius) {
            this.onHit(otherBox);
        }
    },
    //Default onhit behaviour kills other player
    onHit(otherBox) {
        if (!otherBox.isInvincible)
            otherBox.isAlive = false;
    }
}


//Attacks are hitboxes managed by their respective skills. Set instances per skill
function Attack(radius) {
    var box = Object.create(Attack.prototype);
    box.radius = radius;
    box.curFrame = 0;
    box.posx, box.posy;
    return box;
}

Attack.prototype = Object.assign({
    activate() {
        this.curFrame = 1;
    },

    deactivate() {
        this.curFrame = 0;
    },

    //Called by the skill every frame
    reposition(px, py) {
        this.posx = px;
        this.posy = py;
        if (this.curFrame > 0){
            this.curFrame++;
        }
    }
}, hitboxMixin);

//Attacks managed by the game state; moves automatically and is not saved
function Projectile(radius, px, py, vx, vy, endFrame){
    var proj = Object.create(Projectile.prototype);
    proj.radius = radius;
    proj.curFrame = 1;
    proj.endFrame = endFrame;
    proj.velx = vx;
    proj.vely = vy;
    proj.posx = px;
    proj.posy = py;
    return proj;
}


Projectile.prototype = Object.assign({
    move(){
        this.posx += this.velx;
        this.posy += this.vely;
        this.curFrame++;
    },

    isDone(){
        return this.curFrame >= this.endFrame;
    }
}, hitboxMixin);


module.exports.Attack = Attack;
module.exports.Projectile = Projectile;
},{}],27:[function(require,module,exports){
//Used server and client side

//Creates new input record
var Deque = require('denque');

function InputRecord() {
    var obj = Object.create(InputRecord.prototype);
    obj._vert = new Deque();
    obj._hori = new Deque();
    obj._skill = new Deque();
    return obj;
}

var dirInputMap = { 'n': -1, '0': 0, '1': 1 };

//Prototype for object that tracks the user inputs
InputRecord.prototype = {
    //Sets keycode for specific input type
    set(newKey, inputType) {
        //Prevent overflow
        if (this[inputType].length >= 100) return;
        //Append keycode to the queue
        this[inputType].push(newKey);
    },

    //API method that consume and return the least recent input. 
    get(){
        return [this._vert.shift(), this._hori.shift(), this._skill.shift()];
    },

    //API method returns if queue is empty. True means lag compensation is needed
    isEmpty(){
        return this._vert.isEmpty();
    },

    //API method wipe out input buffer when dumping frames
    clear(){
        this._vert.clear();
        this._hori.clear();
        this._skill.clear();
    },

    //Input processor method that delegates different method types to different records   
    process(inputCode) {
        var [v, h, s] = this.unpack(inputCode);
        //Validate input
        if (h === undefined || v === undefined || s === NaN || s > 4) return;
        this.set(v, '_vert');
        this.set(h, '_hori');
        this.set(s, '_skill');
    },

    //API method unpacks inputCode into numbers. Format is vert, hori, skill (3 chars)
    unpack(inputCode) {
        return [dirInputMap[inputCode[0]], dirInputMap[inputCode[1]], parseInt(inputCode[2])];
    },

    //API method reverses unpack action and returns inputcode for redirecting
    pack(...args) {
        var code = '';
        for (let i = 0; i < 3; i++) {
            if (args[i] === -1) code += 'n';
            else code += args[i].toString();
        }
        return code;
    }
};

module.exports = InputRecord;
},{"denque":33}],28:[function(require,module,exports){
var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Cut(character, attackList, projectileList){
    var skill = Object.assign(Object.create(Cut.prototype), Skill(character));
    var attackRadius = 20;
    skill.attack = Attack(attackRadius);
    attackList.push(skill.attack);
    //Distance between center of attack hitbox and center of character
    skill.centerDist = character.radius + attackRadius;
    return skill;
}

Cut.prototype = Object.assign(Object.create(Skill.prototype),
{
    cooldown: 15, endFrame: 8,
    _activeProcess(){
        switch (this.curFrame) {
            //When attack starts prevent character from turning
            case 1:
                this.character.canTurn = false;
                break;
            //On frame 5 the hitbox ends and the character can turn
            case 5:
                this.attack.deactivate();
                this.character.canTurn = true;
                break;
            //Frame 3 is first active frame
            case 3:
                this.attack.activate();
            case 4:
                //3, 4 are active frames in which the hitbox moves with the character
                var px = this.character.posx + this.character.facex * this.centerDist;
                var py = this.character.posy + this.character.facey * this.centerDist;
                this.attack.reposition(px, py);
                break;
        }
    },
});

module.exports = Cut;
},{"../../hitbox.js":26,"../skill.js":32}],29:[function(require,module,exports){
var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Dash(character) {
    return Object.assign(Object.create(Dash.prototype), Skill(character));
}

Dash.prototype = Object.assign(Object.create(Skill.prototype), {
    cooldown: 60, endFrame: 5,
    _activeProcess() {
        switch (this.curFrame) {
            //Cant turn during dash
            case 1:
                this.character.canTurn = false;
                break;
            //Dash lasts for 3 frames
            case 2:
            case 3:
            case 4:
                this.character.frameSpeed = this.character.baseSpeed * 4;
                this.character.isMoving = true;
                break;
            case this.endFrame:
                this.character.canTurn = true;
                this.character.frameSpeed = this.character.baseSpeed;
                break;
        }
    }
});

module.exports = Dash;
},{"../../hitbox.js":26,"../skill.js":32}],30:[function(require,module,exports){
var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Dodge(character) {
    return Object.assign(Object.create(Dodge.prototype), Skill(character));
}

Dodge.prototype = Object.assign(Object.create(Skill.prototype), {
    cooldown: 30*3.5, endFrame: 6,
    _activeProcess() {
        switch (this.curFrame) {
            //Invincible for first 5 frames, vulnerable last frame
            case 1:
                this.character.isInvincible = true;
                break;
            case this.endFrame:
                this.character.isInvincible = false;
                break;
        }
    }
});

module.exports = Dodge;
},{"../../hitbox.js":26,"../skill.js":32}],31:[function(require,module,exports){
var Skill = require('../skill.js');
var Attack = require('../../hitbox.js').Attack;

function Vortex(character, attackList, projectileList) {
    var skill = Object.assign(Object.create(Vortex.prototype), Skill(character));
    skill.attack = Attack(35);
    attackList.push(skill.attack);
    return skill;
}

Vortex.prototype = Object.assign(Object.create(Skill.prototype), {
    //15 sec cooldown, 4 sec duration
    cooldown: 30 * 15, endFrame: 30 * 4,
    _activeProcess() {
        //Hitbox and invincibility starts on frame 11
        if (this.curFrame === 11) {
            this.character.isInvincible = true;
            this.attack.activate();
        }
        //Hitbox will always be centered around user
        if (this.curFrame >= 11) {
            this.attack.reposition(this.character.posx, this.character.posy);
        }
        //Hitbox and invincibility ends on last active frame, so 10 frames of vulnerability
        if (this.curFrame === this.endFrame-10) {
            this.attack.deactivate();
            this.character.isInvincible = false;
        }
    }
});

module.exports = Vortex;
},{"../../hitbox.js":26,"../skill.js":32}],32:[function(require,module,exports){

function Skill(character){
    var skill = Object.create(Skill.prototype);
    //Frame 0 means skill is inactive
    skill.curFrame = 0;
    skill.curCooldown = 0;
    //Skill references its user to change properties
    skill.character = character;
    return skill;
}

Skill.prototype = {
    //Uses a skill if its cooldown has passed. Returns whether skill was actually used
    use(){
        if (this.curCooldown === 0 && this.character.canAct) {
            this.character.canAct = false;
            //Active skills start on frame 1
            this.curFrame = 1;
            this.curCooldown = this.cooldown;
            return true;
        }
        return false;
    },

    activeProcess(){
        //Custom skill code
        this._activeProcess();
        //When skill is on last frame, character can act and skill becomes inactive
        if (this.curFrame >= this.endFrame){
            this.curFrame = 0;
            this.character.canAct = true;
            return;
        }
        this.curFrame++;
    },

    //Adheres to frameProcess interface
    frameProcess(){
        //If skill is active, active process
        if (this.curFrame > 0){
            this.activeProcess();
        }
        //Lower cooldown every frame
        if (this.curCooldown > 0){
            this.curCooldown--;
        }
    }
};
//Excluded cooldown, endFrame, _activeProcess

module.exports = Skill;
},{}],33:[function(require,module,exports){
'use strict';

/**
 * Custom implementation of a double ended queue.
 */
function Denque(array) {
  // circular buffer
  this._list = new Array(4);
  // bit mask
  this._capacityMask = 0x3;
  // next unread item
  this._head = 0;
  // next empty slot
  this._tail = 0;

  if (Array.isArray(array)) {
    this._fromArray(array);
  }
}

/**
 * -------------
 *  PUBLIC API
 * -------------
 */

/**
 * Returns the item at the specified index from the list.
 * 0 is the first element, 1 is the second, and so on...
 * Elements at negative values are that many from the end: -1 is one before the end
 * (the last element), -2 is two before the end (one before last), etc.
 * @param index
 * @returns {*}
 */
Denque.prototype.peekAt = function peekAt(index) {
  var i = index;
  // expect a number or return undefined
  if ((i !== (i | 0))) {
    return void 0;
  }
  var len = this.size();
  if (i >= len || i < -len) return undefined;
  if (i < 0) i += len;
  i = (this._head + i) & this._capacityMask;
  return this._list[i];
};

/**
 * Alias for peakAt()
 * @param i
 * @returns {*}
 */
Denque.prototype.get = function get(i) {
  return this.peekAt(i);
};

/**
 * Returns the first item in the list without removing it.
 * @returns {*}
 */
Denque.prototype.peek = function peek() {
  if (this._head === this._tail) return undefined;
  return this._list[this._head];
};

/**
 * Alias for peek()
 * @returns {*}
 */
Denque.prototype.peekFront = function peekFront() {
  return this.peek();
};

/**
 * Returns the item that is at the back of the queue without removing it.
 * Uses peekAt(-1)
 */
Denque.prototype.peekBack = function peekBack() {
  return this.peekAt(-1);
};

/**
 * Returns the current length of the queue
 * @return {Number}
 */
Object.defineProperty(Denque.prototype, 'length', {
  get: function length() {
    return this.size();
  }
});

/**
 * Return the number of items on the list, or 0 if empty.
 * @returns {number}
 */
Denque.prototype.size = function size() {
  if (this._head === this._tail) return 0;
  if (this._head < this._tail) return this._tail - this._head;
  else return this._capacityMask + 1 - (this._head - this._tail);
};

/**
 * Add an item at the beginning of the list.
 * @param item
 */
Denque.prototype.unshift = function unshift(item) {
  if (item === undefined) return this.length;
  var len = this._list.length;
  this._head = (this._head - 1 + len) & this._capacityMask;
  this._list[this._head] = item;
  if (this._tail === this._head) this._growArray();
  if (this._head < this._tail) return this._tail - this._head;
  else return this._capacityMask + 1 - (this._head - this._tail);
};

/**
 * Remove and return the first item on the list,
 * Returns undefined if the list is empty.
 * @returns {*}
 */
Denque.prototype.shift = function shift() {
  var head = this._head;
  if (head === this._tail) return undefined;
  var item = this._list[head];
  this._list[head] = undefined;
  this._head = (head + 1) & this._capacityMask;
  if (head < 2 && this._tail > 10000 && this._tail <= this._list.length >>> 2) this._shrinkArray();
  return item;
};

/**
 * Add an item to the bottom of the list.
 * @param item
 */
Denque.prototype.push = function push(item) {
  if (item === undefined) return this.length;
  var tail = this._tail;
  this._list[tail] = item;
  this._tail = (tail + 1) & this._capacityMask;
  if (this._tail === this._head) {
    this._growArray();
  }

  if (this._head < this._tail) return this._tail - this._head;
  else return this._capacityMask + 1 - (this._head - this._tail);
};

/**
 * Remove and return the last item on the list.
 * Returns undefined if the list is empty.
 * @returns {*}
 */
Denque.prototype.pop = function pop() {
  var tail = this._tail;
  if (tail === this._head) return undefined;
  var len = this._list.length;
  this._tail = (tail - 1 + len) & this._capacityMask;
  var item = this._list[this._tail];
  this._list[this._tail] = undefined;
  if (this._head < 2 && tail > 10000 && tail <= len >>> 2) this._shrinkArray();
  return item;
};

/**
 * Soft clear - does not reset capacity.
 */
Denque.prototype.clear = function clear() {
  this._head = 0;
  this._tail = 0;
};

/**
 * Returns true or false whether the list is empty.
 * @returns {boolean}
 */
Denque.prototype.isEmpty = function isEmpty() {
  return this._head === this._tail;
};

/**
 * Returns an array of all queue items.
 * @returns {Array}
 */
Denque.prototype.toArray = function toArray() {
  return this._copyArray(false);
};

/**
 * -------------
 *   INTERNALS
 * -------------
 */

/**
 * Fills the queue with items from an array
 * For use in the constructor
 * @param array
 * @private
 */
Denque.prototype._fromArray = function _fromArray(array) {
  for (var i = 0; i < array.length; i++) this.push(array[i]);
};

/**
 *
 * @param fullCopy
 * @returns {Array}
 * @private
 */
Denque.prototype._copyArray = function _copyArray(fullCopy) {
  var newArray = [];
  var list = this._list;
  var len = list.length;
  var i;
  if (fullCopy || this._head > this._tail) {
    for (i = this._head; i < len; i++) newArray.push(list[i]);
    for (i = 0; i < this._tail; i++) newArray.push(list[i]);
  } else {
    for (i = this._head; i < this._tail; i++) newArray.push(list[i]);
  }
  return newArray;
};

/**
 * Grows the internal list array.
 * @private
 */
Denque.prototype._growArray = function _growArray() {
  if (this._head) {
    // copy existing data, head to end, then beginning to tail.
    this._list = this._copyArray(true);
    this._head = 0;
  }

  // head is at 0 and array is now full, safe to extend
  this._tail = this._list.length;

  this._list.length *= 2;
  this._capacityMask = (this._capacityMask << 1) | 1;
};

/**
 * Shrinks the internal list array.
 * @private
 */
Denque.prototype._shrinkArray = function _shrinkArray() {
  this._list.length >>>= 1;
  this._capacityMask >>>= 1;
};


module.exports = Denque;

},{}]},{},[11]);
