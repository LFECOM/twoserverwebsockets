var http = require('http');
var url = require('url');
var server = http.createServer();


server.listen(8900);
server.on('request', function(request, response) {
    response.writeHead(200);
    response.end('no route found');
    console.log('on request handler', request.url, request.method);
});





var WebSocketServer = require('ws').Server
var wss_server = new WebSocketServer({ server: server })

wss_server.on('connection', function connection(ws) {
    var location = url.parse(ws.upgradeReq.url, true);
    // you might use location.query.access_token to authenticate or share sessions
    // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

    console.log('on connection web socket server');
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');
});

console.log("*****************before init of socket io*********************");
console.log("Number of request listners ", server.listeners('request').length);
console.log("Number of upgrade listners ", server.listeners('upgrade').length);

var io_server = require('socket.io')(server);
io_server.serveClient(true);

var listners = server.listeners('upgrade').slice(0);
server.removeAllListeners('upgrade');

server.on('upgrade', function(request, socket, upgradeHead) {
    //   response.writeHead(200);
    //   response.end('no route found');
    console.log('on upgrade handler',request.url, request.method);
    if(request.url.indexOf('socket.io') >= 0){
        io_server.eio.handleUpgrade(request, socket, upgradeHead);
    }
    if(request.url.indexOf('ws') >= 0) {

        var head = new Buffer(upgradeHead.length);
        upgradeHead.copy(head);

        wss_server.handleUpgrade(request, socket, head, function(client) {
            wss_server.emit('connection'+request.url, client);
            wss_server.emit('connection', client);
        });
    }

});

console.log("*****************after init of socket io*********************");
console.log("Number of request listners ", server.listeners('request').length);
console.log("Number of upgrade listners ", server.listeners('upgrade').length);


io_server.on('connection', function (socket_io) {
    socket_io.on('huj', function (msg) {
        console.log('received ws on huj', msg);
        io_server.emit('huj', {huj: 'ws response from private server'});
    });
});

var WebSocket = require('ws');
var ws = WebSocket.connect('ws://localhost:8900/ws');

ws.on('open', function open() {
    console.log('connected')
    ws.send('something');
});

ws.on('message', function(data, flags) {
    // flags.binary will be set if a binary data is received.
    // flags.masked will be set if the data was masked.
    console.log('recived a message')
});

var socket_io_client = require('socket.io-client')('http://localhost:8900');
socket_io_client.on('connect', function(){
   console.log('socket-io-client on connect')
    socket_io_client.emit('huj', "DASASD");
});
socket_io_client.on('event', function(data){
    console.log('socket-io-client on event')
});
socket_io_client.on('disconnect', function(){
    console.log('socket-io-client on disconnect')

});

