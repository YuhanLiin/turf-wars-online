var newid = require('shortid').generate;
var Promise = require('bluebird');
var redis = Promise.promisifyAll(require("redis"));

//Client from repo. Returns the Lock class
var pub;
function setPub(repoPub){
    pub = repoPub;
    return Lock;
}

//Class for building lock objects with given key and random values. Default expiry is 2s
function Lock(key, expiry=3000) {
    var id = newid();
    return Object.assign(Object.create(Lock.prototype),
        {_id: id, _key: 'lock:'+ key, _expiry: expiry});
}

//Set the lock "lock:key" if it isnt on hold for some time
Lock.prototype.lock = function(){
    return pub.multi().set(this._key, this._id, 'NX', 'PX', this._expiry).execAsync()
    //Throw an error for failed lock attempts which will be caught by dependants
    .then(function(batch){
        var result = batch[0];
        if (result === null) throw 'LockFailed';
        return result;
    })
}

//If the lock's id is same as the one used to set it, meaning it was set in the same transaction, then remove it
Lock.prototype.unlock = function(){
    var self = this;
    return pub.multi().get(this._key).execAsync()
    .then(function(batch){
        var id = batch[0];
        if (id === self._id){
            return pub.multi().del(self._key).execAsync();
        }
        return Promise.resolve();
    });
}

//Takes list of locks and acquires them all. If anyone fails then everyone fails
Lock.multiLock = function(args){
    return Promise.all(args.map(lk=>lk.lock()))
    .catch(function(err){
        //When a multilock fails midway, the locks already set need to be removed since transaction failed
        if (err === 'LockFailed') {
            return Lock.multiUnlock(args)
            .then(function(){
                throw err;
            });
        }
        //Propagate error to client in all cases
        throw err;
    })
}

//Takes a list of locks and releases them. Doesnt throw
Lock.multiUnlock = function(args){
    return Promise.all(args.map(lk=>lk.unlock()));
}

module.exports = setPub;