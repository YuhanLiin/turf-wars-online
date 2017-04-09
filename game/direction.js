var repo = require('../repository.js');

var vertMap = {'u':-1, 'd':1, '':0};
var horiMap = {'l':-1, 'r':1, '':0};

function ServerInput(game){
    var obj = {};
    for (let player in game.players){
        obj[player] = {dirx: 0, diry:0};
    }

    function inputHandler(pattern, channel, message){
        if (channel === 'Input/'+game.id){
            message = message.split(':');
            var player = message[0];
            var inputType = message[1];
            var inputCode = message[2];
            switch(inputType){
                case 'v':
                    obj[player].diry = vertMap[inputCode];
                    break;
                case 'h':
                    obj[player].dirx = horiMap[inputCode];
                    break;
            }
        }
    }
    repo.sub.on('pmessage', inputHandler);

    obj.clean = ()=>repo.sub.removeListener('pmessage', inputHandler);
}