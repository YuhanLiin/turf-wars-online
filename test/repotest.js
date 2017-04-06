var assert = require('assert');
var repo = require('../repository.js');

var notifs = [];
before(function(){
    repo.sub.on('pmessage', function(pattern, channel, message){
        notifs.push(channel+message);
    });
});

describe('joinRoom()', function(){
    after(function(){ 
        notifs = [];
        return repo.pub.flushdbAsync();
    });

    it('should add new user to room', function(){
        //Add new user to room1. Get the room
        return repo.joinRoom('room1', 'user1')
        .then(()=>repo.pub.smembersAsync('Room:room1'))
        //Check if room1 only has user1
        .then(function(room1){
            room1 = room1;
            assert.deepStrictEqual(room1, ['user1']);
            //Get user1's room mapping
            return repo.pub.hgetAsync('user1', 'room');
        })
        //Check if room1 is mapped to user1
        .then( userroom=>{assert.equal(userroom, 'Room:room1');});
    });

    //Check for existence of the room add event
    it('should emit Rooms/add event', function(){       
        assert.deepStrictEqual(notifs, ['Rooms/add'+'Room:room1'])
    });

    it('should create room when first member is added', function(){
        //Is room1 available?
        return repo.pub.smembersAsync('availableRooms')
        .then( set=>{assert.deepStrictEqual(set, ['Room:room1']);} );
    });

    it('should delete old room after 2nd user is added', function(){
        //Add 2nd user
        return repo.joinRoom('room1', 'user2')
        //Make sure the room doesnt exist in redis
        .then(()=>repo.pub.existsAsync('Room:room1'))
        .then((reply)=>{assert(!reply);})
        //Make sure room doesnt exist in availalbe rooms
        .then(()=>repo.pub.smembersAsync('availableRooms'))
        .then((set)=>{assert.deepStrictEqual(set, []);});
    });

    it('should create new game room and change user mappings as well', function(){
        //Should add new game room to redis with both users
        return repo.pub.smembersAsync('Game:room1')
        .then(game=>assert.deepStrictEqual(game.sort(), ['user1', 'user2'].sort()))
        //Should add key to game rooms
        .then(()=>repo.pub.smembersAsync('gameRooms'))
        .then(gameRooms=>assert.deepStrictEqual(gameRooms, ['Game:room1']))
        //Change user mappings
        .then(()=>repo.pub.hgetAsync('user1', 'room'))
        .then(room=>assert.strictEqual(room, 'Game:room1'), 'user1 should be mapped to gameroom')
        .then(()=>repo.pub.hgetAsync('user2', 'room'))
        .then(room=>assert.strictEqual(room, 'Game:room1'), 'user2 should be mapped to gameroom')
    });

    it('should emit game related events', function(){
        //Make sure start game notifs are sent to users
        assert(notifs.includes('Games/add'+'Game:room1'), 'Game room notif down');
        assert(notifs.includes('StartGame/'+'user1'), 'User1 startgame notif down');
        assert(notifs.includes('StartGame/'+'user2'), 'User2 startgame notif down');
    });

    it('should throw when adding to full room', function(){
        //Make sure adding to a full room causes a throw
        return repo.pub.saddAsync('Room:room2', 'a','b')
        .then(()=>repo.joinRoom('room2', 'c'))
        .then(()=>assert.fail('Should have thrown'),
              (err)=>assert.strictEqual(err, 'FullRoom'));
    });

    it('should throw when user is already present', function(){
        return repo.pub.hmsetAsync('user3', 'room', '')
        .then(()=>repo.joinRoom('x','user3'))
        .then(()=>assert.fail('Should have thrown'),
            (err)=>assert.strictEqual(err, 'UserExists'));
    });

    it('should throw when game exists', function(){
        return repo.joinRoom('room1', 'user5')
        .then(()=>assert.fail('Should have thrown'),
            (err)=>assert.strictEqual(err, 'GameExists'));
    });
});

describe('leaveRoom()', function(){
    after(function(){ 
        notifs = [];
        return repo.pub.flushdbAsync();
    });

    it('should do nothing on empty delete', function(){
        return repo.leaveRoom('dne')
        .then(()=>repo.pub.smembersAsync('availableRooms'))
        .then(set=>assert.deepStrictEqual(set, []));
    });

    it('should delete room and user if user is only one', function(){
        //Make a new room with 1 user then leave it
        return repo.joinRoom('room1', 'user1')
        .then(()=>repo.leaveRoom('user1'))
        //The user should be gone
        .then(()=>repo.pub.existsAsync('user1'))
        .then(reply=>assert(!reply, 'user1 should be deleted'))
        //The room should be gone from redis and available rooms
        .then(()=>repo.pub.existsAsync('Room:room1'))
        .then(reply=>assert(!reply, 'room1 should be deleted'))
        .then(()=>repo.pub.smembersAsync('availableRooms'))
        .then(set=>assert.deepStrictEqual(set, []));
    });

    it('should inform of deleted room', function(){
        assert(notifs.includes('Rooms/add'+'Room:room1'));
    })

    it('should delete user only if user is not only one', function(){
        //Make a new room with joinRoom then manually add another member (uncommon case)
        return repo.joinRoom('room2', 'b')
        .then(()=>repo.pub.saddAsync('Room:room2', 'a'))
        //Make first member leave
        .then(()=>repo.leaveRoom('b'))
        //The room should exist in redis and available rooms
        .then(()=>repo.pub.sismemberAsync('availableRooms', 'Room:room2'))
        .then(reply=>assert(reply, 'room2 should still exist'))
        .then(()=>repo.pub.smembersAsync('Room:room2'))
        .then(set=>assert.deepStrictEqual(['a'], set));
    })

    it('should delete whole game if user disconnects', function(){
        return repo.joinRoom('room3', 'user1')
        .then(()=>repo.joinRoom('room3', 'user2'))
        .then(()=>repo.leaveRoom('user1'))

        .then(()=>repo.pub.sismemberAsync('gameRooms', 'Game:room3'))
        .then(reply=>assert(!reply, 'gameroom 3 should not exist in game rooms'))

        .then(()=>repo.pub.existsAsync('Game:room3'))
        .then(reply=>assert(!reply, 'gameroom 3 should not exist in redis'))

        .then(()=>repo.pub.existsAsync('user1'))
        .then(reply=>assert(!reply, 'user1 should not exist'))
        .then(()=>repo.pub.existsAsync('user2'))
        .then(reply=>assert(!reply, 'user2 should not exist'))
        .then(()=>repo.leaveRoom('user2'));
    })

    it('should inform of deleted game and also a disconnection to users', function(){
        assert(notifs.includes('Games/delete'+'Game:room3'), 'notif for deleting room3');
        assert(notifs.includes('EndGame/disconnect/'+'user1'), 'notif for telling user1');
        assert(notifs.includes('EndGame/disconnect/'+'user2'), 'notif for telling user2');
    })
});

describe('getRooms()', function () {
    afterEach(function () {
        return repo.pub.flushdbAsync();
    });

    it('should return empty list', function () {
        return repo.getRooms()
        .then(rooms=>assert.deepStrictEqual(rooms, []));
    });

    it('should return all room ids', function () {
        return repo.joinRoom('room1', 'a')
        .then(() =>repo.joinRoom('room2', 'b'))
        .then(() =>repo.getRooms())
        .then(rooms=>assert.deepStrictEqual(rooms.sort, ['room1', 'room2'].sort))
        .then(() =>repo.leaveRoom('b'))
        .then(() =>repo.getRooms())
        .then(rooms=>assert.deepStrictEqual(rooms, ['room1']));
    });
});

describe('selectChar()', function () {
    before(function () {
        return repo.joinRoom('room1', 'user1')
        .then(() =>repo.joinRoom('room1', 'user2'))
        .then(()=>notifs = []);
    });

    after(function () {
        return repo.pub.flushdbAsync();
    })

    it('should throw for unregistered users', function () {
        return repo.selectChar('user3', 'char')
        .then(function () {
            assert.fail('Should have thrown');
        },
        function (err) {
            assert.strictEqual(err, 'UnregisteredUser');
        });
    });

    it("should update user's char selection", function () {
        notifs = [];
        return repo.selectChar('user1', 'char')
        .then(() =>repo.pub.hgetAsync('user1', 'character'))
        .then(char=>assert.strictEqual(char, 'char'))
        //Make sure notif dont send prematurely
        .then(() =>assert.deepStrictEqual([], notifs));
    });

    it("should send notif when both users have selected characters", function () {
        return repo.selectChar('user2', 'char2')
        .then(() =>repo.pub.hgetAsync('user2', 'character'))
        .then(char=>assert.deepStrictEqual(char, 'char2', 'should have set char2'))
        .then(function () {
            for (let i = 0; i < notifs.length; i++) {
                if (notifs[i].startsWith('CreateGame/user2')) {
                    var json = JSON.parse(notifs[i].replace('CreateGame/user2', ''));
                    return assert.deepStrictEqual(json, { 'user1': 'char', 'user2': 'char2' }, 'should send right notif');
                }
            }
            return assert.fail('should send notif');
        });
    })
})