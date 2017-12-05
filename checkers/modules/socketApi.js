var socket_io = require('socket.io');
var router = require('../routes/index');
var io = socket_io();
var socketApi = {};
var gc = require('../middleware/game');
var session = require('express-session');

var noGamesFound = true;
var sockets = [];
socketApi.io = io;


io.on('connection', function(socket){
  console.log('A user connected');
  //console.log(socket.id);


  socket.on('messageToOpponent', function(msg){
    console.log(msg);
    console.log(this.gameId);
    console.log(this.id);
    console.log(sockets.length);
    for(var i = 0; i < sockets.length; i++){
      console.log("IDS " + sockets[i].id);
      if(sockets[i].gameId == this.gameId && this.id != sockets[i].id){
        io.to(sockets[i].id).emit('messageFromOpponent', msg);
      }
    }

  });

  socket.on('game', function(game){
    console.log(game);
  });


  //request to make game
  socket.on('makeGame', function (username) {
    console.log(username);
    //authenticate username;
    noGamesFound = true;
    for(var i = 0; i < gc.gameList.length; i++){
      if((gc.gameList[i]['playerOne'] == username || gc.gameList[i]['playerTwo'] == username)){
        noGamesFound = false;
        console.log("User already has game");
        io.emit('alreadyJoined', username);
      }
    }

    if(noGamesFound == true){
      gc.addGame(this, username);
      var gameId = gc.gameList[gc.gameList.length - 1].id
      this.gameId = gameId;
      sockets.push(this);
      io.emit('gameCreated', {
        username: username,
        gameId: gameId
      });
    }
    //console.log(sockets);
    console.log(gc);
  });



  //request to join gaem
  socket.on('joinGame', function(username){
    console.log(username + " wants to join a game");
    var alreadyInGame = false;
    for(var i = 0; i < gc.gameList.length; i++){
      if(gc.gameList[i]['playerOne'] == username || gc.gameList[i]['playerTwo'] == username){
        alreadyInGame = true;
        console.log("User already has game");
        io.emit('alreadyJoined', username);
      }
    }

    if(!alreadyInGame){
      console.log("Add " + username + " to game");
      var gameId = gc.gameSeeker(this, username);
      this.gameId = gameId;
      io.emit('joinSuccess', gameId);
      console.log("JOIN SUCCESS");
      console.log(this.gameId);
    }
  });

  console.log(gc);
});




module.exports = socketApi;
