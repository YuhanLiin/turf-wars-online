function KeyInput() {
    var manager = Object.create(KeyInput.prototype);
    
    manager._vert = 0;
    manager._hori = 0;
    manager._skill = 0;
    return manager;
}

KeyInput.prototype = {
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
            case '1':
            case '2':
            case '3':
            case '4':
                this._skill = input;
                break;
        }
    },

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
            case '1':
            case '2':
            case '3':
            case '4':
                this._skill = 0;
                break;
        }
    },

    isEmpty() {
        return false;
    },

    get() {
        return [this._vert, this._hori, this._skill];
    },

    clear() {}
}

function Controls() {
    //Maps keydown keycodes to the type of input. Defaults to WASD for UDLR and JKL; for the 4 skills
    var keyMap = { '87': 'u', '83': 'd', '65': 'l', '68': 'r', '74': 1, '75': 2, '76': 3, '186': 4, '13': 'enter' };
    return {
        registerHandler(type, inputHandler) {
            $('body').on(type, function (e) {
                var input = keyMap[e.which.toString()];
                return inputHandler(input);
            });
        },
        makeInputManager() {
            var manager = KeyInput();
            this.registerHandler('keydown', manager._downHandler);
            this.registerHandler('keyup', manager._upHandler);
            return manager;
        }
    };
}

module.exports = Controls;
