var shorthash = require('shorthash');

var secret = 'lol';

function sh(string){
    return shorthash.unique(string+secret);
}

module.exports.sh = sh;