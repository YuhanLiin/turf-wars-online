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

var inputMap = {'u':-1, 'd':1, 'l':-1, 'r':1, '1':1, '2':2, '3':3, '4':4};

//Prototype for object that tracks the user inputs
InputRecord.prototype = {
    //Sets keycode for specific input type
    set(newKey, onoff, inputType) {
        var curKey = this[inputType].peekBack();
        //If input is turned off, turn it off if the input key matches the currently stored key
        if (onoff === '0') {
            if (newKey === curKey || curKey === undefined) {
                newKey = 0;
            }
            else{
                newKey = curKey;
            }
        }
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
    //Format is vert, hori, skill
    process(inputCode) {
        this.set(inputMap[inputCode[0]], inputCode[1], '_vert');
        this.set(inputMap[inputCode[2]], inputCode[3], '_hori');
        this.set(inputMap[inputCode[4]], inputCode[5], '_skill');
    }
};

module.exports = InputRecord;