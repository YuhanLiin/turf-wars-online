var repo = require('../repository.js');
//Add sub

//Prototype for object that tracks the user input for one type of input
var Record = {
    //Initialize the input as unpressed
    init(bufferTime, userId){
        this.lastPress = Date.now();
        this.input = '';
        this.bufferTime = bufferTime;
        this.userId = userId;
        return this;
    },

    //Every time the input is entered, update the last time the input was pressed
    set(inputCode) {
        this.lastpress = Date.now();
        //If the input is different than the current input, send notif to redis
        if (this.input !== inputCode) {
            this.input = inputCode;
            repo.notifyGame(this.userId, 'changeInput', input);
        }
        this._timedReset();
    },

    //Keeps the input for the buffered time limit, then flush it after if nothing was entered in between
    _timedReset() {
        setTimeout(function () {
            if (Date.now() - this.lastpress >= this.bufferTime) {
                this.input = '';
                //Send redis notif for flushed input
                repo.notifyGame(this.userId, 'changeInput', input);
            }
        }, this.bufferTime+1);
    }
};

//Input processor method that delegates different method types to different records
function process(inputCode) {
    switch (inputCode) {
        //Up and down are vertical inputs
        case 'u':
        case 'd':
            this._vertRecord.set(inputCode);
            break;
        //Left and right are horizontal inputs
        case 'l':
        case 'r':
            this._horiRecord.set(inputCode);
            break;
        //Numbers represent skill activation inputs
        case '1':
        case '2':
        case '3':
        case '4':
            this._skillRecord.set(inputCode);
            break;
    }
};

//Creates new input processor object that contains 3 record objects
module.exports.init = function (socketId) {
    return {
        //Movement inputs are buffered for 40 ms because that's how often the browsers sends held down inputs
        _vertRecord: Object.create(Record).init(40, socketId),
        _horiRecord: Object.create(Record).init(40, socketId),
        //Skill inputs are buffered longer
        _skillRecord: Object.create(Record).init(200, socketId),
        process: process
    }
};