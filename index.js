var http = require("http").createServer();
var url = require("url");
var fs = require("fs");
var formBody = require('body/form');
var shortid = require('shortid');

var repo = require("./repository.js")
var io = require("./sockets").init(http);

//Allow server to run only after redis is flushed
repo.flushPromise.then(http.listen(8000));

//Send statuscode
function sendCode(res, statusCode){
    res.statusCode = statusCode;
    res.end(statusCode.toString()+": Something went wrong");
}

//Send a file or a 404
function sendFile(res, filepath, context={}, type="text/html") {
    res.setHeader("content-type", type);
    fs.readFile('.'+filepath, function (err, data) {
        if (err) {
            sendCode(404);
        }
        else {
            var data = data.toString();
            for (let prop in context){
                if (context.hasOwnProperty(prop)){
                    data = data.split(`{{${prop}}}`).join(context[prop].toString());
                }
            }
            res.end(data);
        }
    })
}

http.on('request', function (req, res) {
    var urlObj = url.parse(req.url, true);
    var path = urlObj.path;
    var query = urlObj.query;

    if (req.method === 'GET') {
        if (path === '/') {
            sendFile(res, "/views/index.html");
        }
        else if (path.startsWith('/js')){
            var filename = path.replace('/js', '');
            sendFile(res, "/static/js"+filename);
        }  
        else if (!path.startsWith('/socket.io')){
            sendCode(res, 404)
        }
    }

    else if (req.method === 'POST') {
        //When entering a room, parse the body for the room id
        if (path === '/room') {
            formBody(req, function(err, body){
                if (err) sendCode(400);
                var roomId = body.roomId;
                //If roomId doesnt exist, that means the user is creating a room, so a random id is generated
                if (!roomId) roomId = shortid.generate();
                //Render the room page with the roomId
                sendFile(res, '/views/newRoom.html', {roomId:roomId});  
            });    
        }
        //Lobby will load all currently available roomIds and paste them to the page
        else if (path === '/lobby') {
            repo.getRooms()
            .then(function(rooms){ 
                sendFile(res, '/views/lobby.html', {rooms:JSON.stringify(rooms)}); 
            })
            //Get room errors are 500 errors
            .catch(function(err){
                console.log(err);
                sendCode(res, 500);
            });
        }
        else{
            sendCode(res, 404);
        }
    }

    res.on("error", function(err){
        console.log(err);
    });
});


    