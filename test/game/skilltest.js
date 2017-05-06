describe('All skills', function(){
    var Skill = require('../../game/skills/skill.js');
    var assert = require('assert');

    describe('Base Skill', function () {
        var skill;
        before(function () {
            skill = Skill({ canAct: true });
            skill._activeProcess = () => { };
            skill.cooldown = 2;
            skill.endFrame = 1;
        });

        beforeEach(function () {
            skill.character.canAct = true;
            skill.curFrame = 0;
            skill.curCooldown = 0;
        });

        it('should only activate when off cooldown and character can act', function () {
            assert(skill.use());
            assert(!skill.use());
            assert.strictEqual(skill.curCooldown, 2);
            skill.curCooldown = 0;
            assert(!skill.use());
        });

        it('should be active for correct # of frames', function () {
            skill.use();
            skill.activeProcess();
            assert.deepStrictEqual([skill.curFrame, skill.character.canAct], [0, true]);
        });

        it('should lower cooldown', function () {
            skill.use();
            skill.frameProcess();
            skill.frameProcess();
            assert.deepStrictEqual([skill.curFrame, skill.character.canAct, skill.curCooldown], [0, true, 0]);
        });
    });

    //Generates test for attack skill. Assumes character isnt moving
    function atkTest(char, skillNum, atkNum, edgeDist, activeFrame, inactiveFrame, endFrame, endTest, activeTest){
        return function(){
            char.skills[skillNum-1].use();
            char.frameProcess();
            var atk = char.attackList[atkNum];
            for (let i=1; i<activeFrame; i++){
                assert.strictEqual(atk.curFrame, 0, `Skill should not be active on frame ${i}`);
                char.frameProcess();
            }
            for (let i=activeFrame; i<inactiveFrame; i++){
                assert(atk.curFrame!==0, `Skill should be active on frame ${i}`);
                assert.strictEqual(atk.posx, char.posx+(char.radius+atk.radius+edgeDist)*char.facex, 
                    `Attack x position wrong on frame ${i}`);
                assert.strictEqual(atk.posy, char.posy+(char.radius+atk.radius+edgeDist)*char.facey, 
                    `Attack y position wrong on frame ${i}`);
                if (activeTest) activeTest(char, atk, i);
                char.frameProcess();
            }
            for (let i=inactiveFrame; i<endFrame; i++){
                assert.strictEqual(atk.curFrame, 0, `Skill not active on frame ${i}`);
                char.frameProcess();
            }
            if (endTest) endTest(char, atk);
        }
    }

    //Test for non attack skills
    function skillTest(char, skillNum, activeFrame, inactiveFrame, endFrame, endTest, activeTest){
        return function(){
            char.skills[skillNum-1].use();
            char.frameProcess();
            for (let i=1; i<activeFrame; i++){
                char.frameProcess();
            }
            for (let i=activeFrame; i<inactiveFrame; i++){
                if (activeTest) activeTest(char, i);
                char.frameProcess();
            }
            for (let i=inactiveFrame; i<endFrame; i++){
                char.frameProcess();
            }
            if (endTest) endTest(char);
        }
    }

    var gamemock = {width: 800, height:700};
    var Slasher = require('../../game/characters/slasher.js');
    describe('Slasher', function(){
        describe('Cut', function(){
            function checkTurn(char, atk){
                assert(char.canTurn, 'should turn');
            }

            it('should start and last right number of frames', atkTest(Slasher(gamemock, 40, 40, 1, 0), 1, 0, 0, 3, 5, 8, checkTurn));
            it('should move attack hitbox and aim diagonally', atkTest(Slasher(gamemock, 40, 40, -1, -1), 1, 0, 0, 3, 5, 8, checkTurn,
                function(char, atk){
                    char.posx += 5;
                    char.posy += 10;
                    assert(!char.canTurn, 'No turning');
                })
            );
        });

        describe('Vortex', function(){
            it('should have correct frame data and movement', atkTest(Slasher(gamemock, 500, 500, 0, -1), 4, 2, -20-35, 11, 80, 90, 
                function(char, atk){
                    assert.strictEqual(char.frameSpeed, char.baseSpeed, `should slow back down`);
                },
                function(char, atk, i){
                    //Movements to test whether the attack follows user
                    char.posx -= 2;
                    char.posy -= 2;
                    assert(char.frameSpeed > 7, `should speed up on frame ${i}`);
                })
            );
        });

        describe('Dash', function(){
            it('should move character in one direction', skillTest(Slasher(gamemock, 40, 40, 1, 1), 2, 2, 5, 5,
                function(char){
                    assert(char.canTurn, 'Should turn');
                    assert.strictEqual(char.frameSpeed, char.baseSpeed, 'Normal speed');
                },
                function(char, i){
                    assert(!char.canTurn, `Should not turn on frame ${i}`);
                    assert.strictEqual(char.frameSpeed, char.baseSpeed*4, `Super speed on frame ${i}`);
                })
            );
        });

        describe('Dodge', function(){
            it('should make character invincible', atkTest(Slasher(gamemock, 40, 40, 1, 1), 3, 1, -20-20, 1, 12, 12,
                function(char){
                    assert(!char.isInvincible, `Should not be invincible`);
                },
                function(char, i){
                    assert(char.isInvincible, `Should be invincible on frame ${i}`);
                })
            );
        });
    });

    var Blaster = require('../../game/characters/blaster.js');
    describe.only('Blaster', function(){
        describe('Grapeshot', function(){
            it('should increase movement speed and set projectile in correct spot', 
                skillTest(Blaster(gamemock, 40, 40, 1, 1), 1, 1, 8, 9, 
                    function(char){
                        assert.strictEqual(char.frameSpeed, char.baseSpeed, 'Should move at normal speed');
                        var proj = char.projectileList[0];
                        assert(proj.velx > 0 && proj.vely > 0, 'Projectile should move in same direction as character');
                        assert(proj.posx > char.posx && proj.posy > char.posy, 
                            'Projectile should be positioned away from character direction');
                        assert.strictEqual(proj.id, 'g');
                    },
                    function(char, i){
                        assert(char.frameSpeed > char.baseSpeed, 'Should move at higher speed');
                    }
                )
            );
        });

        describe('Recoil Blast', function(){
            it('should move character forward and shoot twice', skillTest(Blaster(gamemock, 400, 350, 1, 0), 2, 2, 10, 10, 
                function(char){
                    assert.strictEqual(char.frameSpeed, char.baseSpeed, 'Should move at normal speed'),
                    assert(char.canTurn, 'Should turn');
                },
                function(char, i){
                    assert.strictEqual(char.frameSpeed, char.baseSpeed*6, `Super speed on frame ${i}`);
                    assert(char.isMoving, `Should keep moving on frame ${i}`);
                    if (i === 5){
                        assert(char.canTurn, 'Should be able to make one turn at frame 5');
                        //Turn character in another direction
                        char.receiveInput(0, -1, 0);
                    }
                    else{
                        assert(!char.canTurn, `Should not turn on frame ${i}`);
                    }

                    if(i === 2){
                        var proj = char.projectileList[0];
                        assert(proj.velx < 0 && proj.vely === 0, 'Projectile should move in opposite direction as character');
                        assert.strictEqual(proj.id, 'r');
                    }
                    else if(i === 6){
                        var proj = char.projectileList[1];
                        assert(proj.velx === 0 && proj.vely > 0, 'Projectile should move in opposite direction as character');
                        assert.strictEqual(proj.id, 'r');
                    }
                })
            );
        })
    })
});