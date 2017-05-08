var ProjectileView = require('./projectileView.js');

function GrapeProjView(){
    var view = Object.assign(new fabric.Circle({
        fill: 'yellow',
        originX: 'center',
        originY: 'center'
    }), ProjectileView);
    return view;
}

function RecoilProjView(){
    var view = Object.assign(new fabric.Circle({
        fill: 'orange',
        stroke: 'red',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center'
    }), ProjectileView);
    return view;
}

//Update for cannon projectile
function _update(){
    var [outer, lining] = this.getObjects();
    outer.setRadius(this.model.radius);
    //Lining will have different radius every 4 draws
    lining.setRadius(this.model.radius * Math.round(this.lineState/4)/4);
    this.lineState++;
    if (this.lineState >= 14) this.lineState = 1;
}
function CannonProjView(){
    var outer = new fabric.Circle({
        fill: 'black',
        originX: 'center',
        originY: 'center'
    });

    var lining = new fabric.Circle({
        fill: '',
        stroke: 'white',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
    });

    var view = Object.assign(new fabric.Group([outer, lining], {
        originX: 'center',
        originY: 'center',
        width: 200, height: 200
    }), ProjectileView);
    //Determines how lining will be drawn
    view.lineState = 1;
    view._update = _update;
    return view;
}

var RealGroup = require('../../realGroup.js');
//Binds to a projectile list. Updates projectile views mappings each update call
function BlasterProjListView(projectileList, x, y){
    //Inherits from RealGroup
    var view = Object.assign(RealGroup([], x, y), {
        update(){
            //Clear off all expired views
            for (let i=0; i<this.components.length; i++){
                let view = this.components[i];
                if (view.isDone()){
                    this.remove(i);
                    i--;
                }
            }

            //Add views for new projectiles
            for (let i=this.components.length; i<projectileList.length; i++){
                let proj = projectileList[i];
                let view = getView(proj);
                this.add(view);
            }

            this.components.forEach(view=>view.update())
        }
    });
    view.update();
    return view;


    function getView(proj){
        switch(proj.id){
            case 'g':
                return GrapeProjView().bind(proj);
            case 'c':
                return CannonProjView().bind(proj);
            case 'r':
                return RecoilProjView().bind(proj);
        }
    }
}

module.exports = BlasterProjListView