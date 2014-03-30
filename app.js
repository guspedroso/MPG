// Welcome to our server side code.

// We shall be using node-static to serve our files,
// and socket.io to be our server. 

// http var
var http = require('http');

// node-static var. This is where we will get node-static
var static = require('node-static');

// file server var. We will get our content from the "client" folder
var fileServer = new static.Server('./client');

// Let's create the file server here
var app = http.createServer(function(request, response) {
	fileServer.serve(request, response);
});
// We will listen on port 12315
app.listen(12315);

// Create the socket server 
var io = require('socket.io').listen(app);

// player var
var players;
var Player = require("./server/Player.js").Player;

// Init it all!!!
init();

// Here is the function to initialize everything else
function init() {
  players = [];

  io.configure(function(){
    io.set("transports", ["websocket"]);
    io.set("log level", 2);
  });
  setEventHandlers();
};

function setEventHandlers() {
  io.sockets.on('connection', onSocketConnect);
};

// Commands to perform upon connection, etc. 
function onSocketConnect(client) {
  console.log("new client connected " + client.id);
  
  client.on('disconnect', clientDisconnect);
  client.on('new player', newPlayer);
  client.on('move player', movePlayer);
  client.on('fire bullet', fireBullet);
};

function clientDisconnect() {
  console.log("player disconnected " + this.id);
};

// This function creates our new player
function newPlayer(data) {
  console.log(data);
  // get the new Player data from our client
  var newPlayer = new Player(data.x, data.y);
  newPlayer.id = this.id;

  // Here we will broadcast the new player info and coords to our other clients
  this.broadcast.emit('new player', { id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY() });

  // Here, we need to get the existing player info to our new player client
  var existingPlayer;
  for (var i = 0; i < players.length; i++) {
    existingPlayer = players[i];
    this.emit('new player', { id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY() });
  };

  // Here we add our new player to our players array
  players.push(newPlayer);
};

function movePlayer(data) {
  console.log(this.id);
  console.log(data);

  // Find the player to move
 // var playerToMove = findPlayer(this.id);

  // Set the new x and y for the player being moved
  //playerToMove.setX(data.x);
  //playerToMove.setY(data.y);

//  this.broadcast.emit('move player', { pid: playerToMove.id, 
//    px: playerToMove.px, py: playerToMove.py, po: playerToMove.po });
};

function fireBullet(data) {
  console.log(this.id);
  console.log(data);
  this.broadcast.emit('fire bullet', { pid: this.id, px: data.px, py: data.py, po: data.po });
};


// This function will locate the player within the array by its assigned ID
function findPlayer(id) {
  for (var i = 0; i < players.length; i++) {
    if (players[i].id == id) {
      return players[i];
    };
  };
};