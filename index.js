var http = require("http").createServer();
var io = require("socket.io")(http);
var url = require("url");
var fs = require("fs");

var repo = require("./repository.js")

function sendFile(res, filepath, type="text/html") {
    res.setHeader("content-type", type);
    fs.readFile('.'+filepath, function (err, data) {
        if (err) {
            res.statusCode = 404;
            res.end("404: " + filepath + " not found");
        }
        else {
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
            repo.getRooms(function (err, rooms) {
                if (err) console.log(err.stack);
                //Templating will be required
                else sendFile(res, '/views/lobby.html');
            });
        }
    }

    res.on("error", function(err){
        console.log(err.stack);
    });
}).listen(8000);

io.of('newRoom').on('connect', function (socket) {
    repo.addRoom(socket.id);

    socket.on("disconnect", function () {
        repo.deleteRoom(socket.id);
    });
});

io.of('lobby').on('connect', function (socket) {
    
});
