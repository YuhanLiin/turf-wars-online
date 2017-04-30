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
    console.log(input)
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
