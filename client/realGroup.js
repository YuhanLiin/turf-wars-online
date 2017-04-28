//Fabricjs groups make no sense, so i use this instead
function RealGroup(components, x, y){
    var group = Object.create(RealGroup.prototype);
    group.left = x;
    group.top = y;
    group.components = components;
    return group;
}

RealGroup.prototype = {
    add(item){
        this.components.push(item);
    },
    //Apply realGroup offsets. Assume position of object has already been reset with default scaling in mind
    offsetAll(){
        var self = this;
        this.components.forEach(function(item){
            item.set({left: item.left+self.left, top: item.top+self.top, scaleX: 1, scaleY: 1});
        });
    },
}

module.exports = RealGroup;