var http = require("http").createServer();
var io = require("socket.io")(http);
var url = require("url");
var fs = require("fs");

var repo = require("./repository.js")

function sendFile(res, filepath, context={}, type="text/html") {
    res.setHeader("content-type", type);
    fs.readFile('.'+filepath, function (err, data) {
        if (err) {
            res.statusCode = 404;
            res.end("404: " + filepath + " not found");
        }
        else {
            var data = data.toString();
            for (let prop in context){
                if (context.hasOwnProperty(prop)){
                    data = data.replace(`{{${prop}}}`, context[prop].toString());
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
        
    }
    else if (req.method === 'POST') {
        if (path === '/newRoom') {
            sendFile(res, '/views/newRoom.html');
        }
        else if (path === '/lobby') {
            repo.getRooms().then(function(rooms){ sendFile(res, '/views/lobby.html', {rooms:JSON.stringify(rooms)}); },
                               function(err){ console.log(err); } );
        }
    }

    res.on("error", function(err){
        console.log(err.stack);
    });
}).listen(8000);


io.of('newRoom').on('connect', function (socket) {
    repo.addRoom(socket.id)
    .catch(function(err){ console.log(err); });

    socket.on("disconnect", function () {
        repo.deleteRoom(socket.id)
        .catch(function(err){ console.log(err); });
    });
});

io.of('lobby').on('connect', function (socket) {
    function pubsubHandler(channel, message){
        console.log(channel);
        socket.emit(channel.replace('Rooms/', ''), message);
    }

    repo.sub.on("message", pubsubHandler);

    socket.on('disconnect', function (){
        repo.sub.removeListener("message", pubsubHandler);
    })
});
