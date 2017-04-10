var input = require('../game/input').create('placeholder');
var repo = require('../repository.js');
var assert = require('assert');

var notifs = [];
var original = repo.notifyGame;
repo.notifyGame = (_, input, type) =>notifs.push(input+':'+type);

describe('inputs', function(){
    describe('Notifications', function(){
        afterEach(function(){
            notifs = [];
        });

        it('should update different input types', function(){
            input.process('u1');
            input.process('l1');
            assert.deepStrictEqual(notifs, ['u1:v', 'l1:h']);
        });

        it('should ignore immediate same-type inputs', function(){
            for (let i=0; i<3; i++){
                input.process('10');
                input.process('l0');
                input.process('u0');
            }
            assert.deepStrictEqual(notifs, ['10:s','l0:h','u0:v']);
        });

        it('should detect same input after buffer period', function(){
            //First do hori and skill input
            input.process('r1');
            input.process('21');
            setTimeout(function(){
                input.process('31');
                input.process('r0');
                //Expect first 2 inputs follow by 2 lack of input notifs, then the other skill input
                assert.deepStrictEqual(notifs, ['r1:h','21:s', '31:s', 'r0:h']);
            }, 30);
        });

        it('should ignore invalid inputs', function(){
            input.process('0');
            input.process('g');
            input.process('');
            assert.deepStrictEqual([], notifs);
        })
    })
});

repo.notifyGame = original;