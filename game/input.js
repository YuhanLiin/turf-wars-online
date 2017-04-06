var repo = require('../repository.js');
//Add sub

//Prototype for object that tracks the user input for one type of input
var Record = {
    //Initialize the input as unpressed
    init(bufferTime){
        this.lastPress = Datetime.now();
        this.input = '';
        this.bufferTime = bufferTime;
        return this;
    },

    //Every time the input is entered, update the last time the input was pressed. If the input is different than the current input, send notif to redis
    set(inputCode) {
        this.lastpress = Datetime.now();
        if (this.input !== inputCode) {
            this.input = inputCode;
            repo.pub.publish('Gameplay/changeInput', input);
        }
        this._timedReset();
    },

    //Keeps the input for the buffered time limit, then flush it after if nothing was entered in between
    _timedReset() {
        setTimeout(function () {
            if (Datetime.now() - this.lastpress >= this.bufferTime) {
                this.input = '';
                repo.pub.publish('Gameplay/changeInput', input);
            }
        }, this.bufferTime+1);
    }
};

function processInputCode(inputCode) {
    switch (inputCode) {
        case 'u':
        case 'd':
            this._vertRecord.set(inputCode);
            break;
        case 'l':
        case 'r':
            this._horiRecord.set(inputCode);
            break;
        case '1':
        case '2':
        case '3':
        case '4':
            this._skillRecord.set(inputCode);
            break;
    }
};

function Processor() {
    return {
        _vertRecord: Object.create(Record).init(10),
        _horiRecord: Object.create(Record).init(10),
        _skillRecord: Object.create(Record).init(300),
        processInputCode: processInputCode
    }
};