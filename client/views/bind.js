//Contains the method used by every view to bind a game model to itself
//Exposed this.model
module.exports = function(model){
    this.model = model;
    //Allow call chaining
    return this;
}