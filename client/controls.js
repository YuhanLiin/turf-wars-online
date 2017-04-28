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

KeyInput.prototype = {
    //Key handler for key down (editing input)
    _downHandler(input) {
        switch (input) {
            case 'u':
                this._vert = -1;
                break;
            case 'd':
                this._vert = 1;
                break;
            case 'l':
                this._hori = -1;
                break;
            case 'r':
                this._hori = -1;
                break;
            case 1:
            case 2:
            case 3:
            case 4:
                this._skill = input;
                break;
        }
    },

    //Key handler for key up (zeroing input)
    _upHandler (input) {
        switch (input) {
            case 'u':
            case 'd':
                this._vert = 0;
                break;
            case 'l':
            case 'r':
                this._vert = 0;
                break;
            case 1:
            case 2:
            case 3:
            case 4:
                this._skill = 0;
                break;
        }
    },

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
    //Maps keydown keycodes to the type of input. Defaults to WASD for UDLR and JKL; for the 4 skills
    var keyMap = { '87': 'u', '83': 'd', '65': 'l', '68': 'r', '74': 1, '75': 2, '76': 3, '186': 4, '13': 'enter' };
    return {
        //Turns an input handler into a mapped key handler and hook it to keydown or keyup
        registerHandler(type, inputHandler) {
            $('body').on('key'+type, function (e) {
                e.preventDefault();
                var input = keyMap[e.which.toString()];
                return inputHandler(input);
            });
        },
        //Create the above input manager with all events registered
        makeInputManager() {
            var manager = KeyInput();
            this.registerHandler('down', manager._downHandler);
            this.registerHandler('up', manager._upHandler);
            return manager;
        }
    };
}

module.exports = Controls;
