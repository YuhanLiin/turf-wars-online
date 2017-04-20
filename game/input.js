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
        if (this[inputType].length >= 30) return;
        //Append keycode to the queue
        this[inputType].push(newKey);
    },

    //API methods that consume and return the least recent input. Will return undefined when inputs run out, which calls for lag compensation
    vert() {
        return this._vert.shift();
    },
    hori() {
        return this._hori.shift();
    },
    skill() {
        return this._skill.shift();
    },

    //Input processor method that delegates different method types to different records
    
    process(inputCode) {
        var [v, h, s] = this.unpack(inputCode);
        //Validate input
        if (h === undefined || v === undefined || s === NaN) return;
        this.set(v, '_vert');
        this.set(h, '_hori');
        this.set(s, '_skill');
    },

    //Unpack inputCode into numbers. Format is vert, hori, skill (3 chars)
    unpack(inputCode) {
        return [dirInputMap[inputCode[0]], dirInputMap[inputCode[1]], parseInt(inputCode[2])];
    },

    //Reverses unpack action and returns inputcode for redirecting
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