var input = require('../game/input').create('placeholder');
var repo = require('../repository.js');
var assert = require('assert');

var notifs = [];
var original = repo.notifyGame;

describe('inputs', function(){
    describe('Notifications', function(){
        afterEach(function(){
            notifs = [];
        });

        //Mock for notifyGame that populates a list with input codes
        before(function () {
            repo.notifyGame = (_, input)=>notifs.push(input);
        });

        //Restore original notifyGame
        after(function(){
            repo.notifyGame = original;
        })

        it('should notify for changes', function(){
            input.process('u');
            input.process('d');
            assert.deepStrictEqual(notifs, ['u', 'd']);
        });

        it('should ignore immediate same-type inputs', function(done){
            for (let i=0; i<3; i++){
                input.process('1');
                input.process('l');
                input.process('u');
            }
            assert.deepStrictEqual(notifs, ['1','l','u']);
            //Need to wait for the lack of inputs to get added before clearing
            setTimeout(done, 100);
        });

        it('should detect lack of input after buffer period', function(done){
            //First do hori and skill input
            input.process('l');
            input.process('2');
            setTimeout(function(){
                //Wait 100ms and enter same skill input
                input.process('2');
                //Expect first 2 inputs follow by 2 lack of input notifs, then the other skill input
                assert.deepStrictEqual(notifs, ['l','2','','', '2']);
                setTimeout(done, 100);
            }, 100);
        });

        it('should not detect lack of input multiple times', function(done){
            //A skill input followed by another one after 100ms
            input.process('4');
            setTimeout(function(){
                input.process('3');
                setTimeout(function () {
                    //After 40ms there should be no lack of input from the first input
                    assert.deepStrictEqual(notifs, ['4', '3']);
                    setTimeout(function () {
                        //After another 40ms there should only be one lack of input
                        assert.deepStrictEqual(notifs, ['4', '3', '']);
                        done();
                    }, 40);
                }, 40);
            },40);
        });

        it('should ignore invalid inputs', function(){
            input.process('0');
            input.process('g');
            input.process('');
            assert.deepStrictEqual([], notifs);
        })
    })
});