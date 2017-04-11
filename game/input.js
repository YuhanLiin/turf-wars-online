//Used server and client side

//Creates new input record
function InputRecord (){
    var obj = Object.create(InputRecord.prototype);
    obj.vert = 0;
    obj.hori = 0;
    obj.skill = 0;
    return obj;
}

//Prototype for object that tracks the user inputs
InputRecord.prototype = {
    //Sets keycode for specific input type
    set(key, onoff, inputType) {
        var curKey = this[inputType];
        //If input is on, set it on
        if (onoff === 1) {
            this[inputType] = key;
        }
        //If input is turned off, turn it off the the input key matches the currently stored key
        else if (onoff === 0) {
            if (key === curKey) {
                this[inputType] = 0;
            }
        }
    },

    //Input processor method that delegates different method types to different records
    process(inputCode) {
        var onoff = parseInt(inputCode[1]);
        switch (inputCode[0]) {
            //Up is -1 y axis
            case 'u':
                this.set(-1, onoff, 'vert');
                break;
            //Down is +1 y axis
            case 'd':
                this.set(1, onoff, 'vert');
                break;
            //Left is -1 x axis
            case 'l':
                this.set(-1, onoff, 'hori');
                break;
            //Right is +1 x axis
            case 'r':
                this.set(1, onoff, 'hori');
                break;
            //Numbers represent skill activation inputs
            case '1':
            case '2':
            case '3':
            case '4':
                this.set(parseInt(inputCode[0]), onoff, 'skill');
                break;
        }
    }
};

module.exports = InputRecord;