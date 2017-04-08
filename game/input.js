var repo = require('../repository.js');

//Prototype for object that tracks the user input for one type of input
var Record = {
    //Initialize the input as unpressed
    init(bufferTime, userId){
        this.lastPress = Date.now();
        this.input = '';
        this.bufferTime = bufferTime;
        //User id to send as notif
        this.userId = userId;
        return this;
    },

    //Every time the input is entered, update the last time the input was pressed
    set(inputCode) {
        this.lastPress = Date.now();
        //If the input is different than the current input, send notif to redis
        if (this.input !== inputCode) {
            this.input = inputCode;
            repo.notifyGame(this.userId, inputCode);
        }
        this._timedReset();
    },

    //Keeps the input for the buffered time limit, then flush it after if nothing was entered in between
    _timedReset() {
        var self = this;
        setTimeout(function () {
            if (Date.now() - self.lastPress >= self.bufferTime) {
                self.input = '';
                //Send redis notif for flushed input
                repo.notifyGame(self.userId, self.input);
            }
        }, self.bufferTime+1);
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
module.exports.create = function (socketId) {
    return {
        //Inputs are held for 45 ms because that's how often the browsers sends held down inputs
        _vertRecord: Object.create(Record).init(45, socketId),
        _horiRecord: Object.create(Record).init(45, socketId),
        _skillRecord: Object.create(Record).init(45, socketId),
        process: process
    }
};