var repo = require('../repository.js')
var Lock = require('../lock.js')(repo.pub);
var assert = require('assert');

//Used to ensure promise throws
function fail(){
    return assert.fail('should have thrown');
}
function checkErr(err){
    return assert.strictEqual(err, 'LockFailed');
}

describe('lock', function(){
    describe('lock(), unlock()', function(){
        afterEach(function(){
            return repo.pub.flushdbAsync();
        });

        beforeEach(function(){
            return repo.pub.setAsync('test', '1');
        });

        it('should throw when locking locked resourses', function(){
            Lock('test').lock();
            return Lock('test').lock()
            .then(fail, checkErr);
        });

        it('should expire and release lock', function(done){
            Lock('test', 1000).lock()
            .then(function(){
                setTimeout(()=>Lock('test').lock().then(()=>done()), 1005);
            });
        });

        it('should not throw when unlocking nonexistent objects', function(){
            return Lock('test').unlock();
        });

        it('should unlock locked resources', function(){
            var lk = Lock('test');
            return lk.lock()
            .then(()=>lk.unlock())
            .then(()=>Lock('test').lock());
        });

        it('should not unlock locks with different id', function(){
            var lk = Lock('test');
            return Lock('test').lock()
            //Try to unlock with diff id, which should fail
            .then(()=>lk.unlock())
            //Locking will conflict with old lock and throw err
            .then(()=>lk.lock())
            .then(fail, checkErr);
        });
    });

    describe('multi lock and unlock', function(){
        afterEach(function(){
            return repo.pub.flushdbAsync();
        });

        //List of redis keys and function for generating locks for the keys
        var keys = ['a', 'b', 'c'];
        function lox(){ return keys.map(key=>Lock(key)); }

        beforeEach(function(){
            //Sets all keys in list to redis
            return keys.reduce((acc, key)=>acc.set(key, key), repo.pub.multi()).execAsync();
        });

        it('should lock all locks', function(){
            var lks = lox();
            //After one multi lock, subsequent locks to the same keys should fail
            return Lock.multiLock(lks)
            .then(()=>Promise.all(lks.map(function(lk){
                return lk.lock().then(fail, checkErr);
            })));
        });

        it('should unlock all locks', function(){
            var lks = lox();
            return Lock.multiLock(lks)
            .then(()=>Lock.multiUnlock(lks))
            .then(()=>Lock.multiLock(lks));
        });
    });
});