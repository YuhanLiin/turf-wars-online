//Creates new input record
function InputRecord(){
    var obj = Object.create(InputRecord.prototype);
    obj.vert = 0;
    obj.hori = 0;
    obj.skill = 0;
}

//Prototype for object that tracks the user inputs
InputRecord.prototype = {
    //Every time the input is entered, send notif. Cap it at once every 20 ms
    set(key, onoff, inputType) {
        var curKey = this[inputType];
        if (onoff === 1) {
            this[inputType] = key;
        }
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
            //Up and down are vertical inputs
            case 'u':
                this.set(-1, onoff, 'vert');
                break;
            case 'd':
                this.set(1, onoff, 'vert');
                break;
                //Left and right are horizontal inputs
            case 'l':
                this.set(-1, onoff, 'hori');
                break;
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