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
        if (h === undefined || v === undefined || s === NaN || s >= 4) return;
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