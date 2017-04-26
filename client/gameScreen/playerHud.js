var views = require('../views/allViews.js');

function Header(x, y, width, height, playerName, charName, textColor){
    var name = new fabric.Text({
        textAlign: 'center',
        top: 10,
        font: 'sans-serif',
        fontSize: 30,
    }),
    var char = views[charName].Sprite(0, height*2/3, height/3);
    return new fabric.Group([char, name],{
        left:x, top:y
    });
}

function SkillList(x, y, width, height, charName){
    
}