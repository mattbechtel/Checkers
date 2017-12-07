var socket_io = require('socket.io');
var router = require('../routes/index');
var io = socket_io();
var socketApi = {};
var gc = require('../middleware/game');
var Player = require('../middleware/player');
var session = require('express-session');

socketApi.io = io;

io.on('connection', function(socket){
  console.log('A user connected');

  socket.on('messageToOpponent', function(msg){
    //console.log(this.gameInfo.playerOne);
    //console.log(this.gameInfo.playerTwo);

    if(this.gameInfo){
      if(this.gameInfo.playerOne.socketID != this.id){
        io.to(this.gameInfo.playerOne.socketID).emit('messageFromOpponenet', msg);
      } else if(this.gameInfo.playerOne.socketID == this.id){
        io.to(this.gameInfo.playerTwo.socketID).emit('messageFromOpponent', msg);
      }
    }
  });

  socket.on('game', function(game){
    console.log(game);
  });


  //request to make game
  socket.on('makeGame', function (username) {
    console.log(username);

    if(!alreadyInGame(this)){
      var player = new Player(username, 1, this.id);
      gc.addGame(this, player);
      var gameId = gc.gameList[gc.gameList.length - 1].id
      this.gameInfo = gc.gameList[gc.gameList.length - 1];
      this.username = username;
      this.playerNum = 1;
      io.to(this.gameInfo.playerOne.socketID).emit('gameCreated', {
        username: username,
        gameId: gameId
      });
    }
  });


  //request to join game
  socket.on('joinGame', function(username){
    console.log(username + " wants to join a game");
    if(!alreadyInGame(this)){
      var player = new Player(username, null, this.id);
      console.log("Adding " + username + " to game");
      this.gameInfo = gc.gameSeeker(this, player);
      this.username = username;
      var gameId = this.gameInfo.id;

      if(this.gameInfo.playerTwo && this.gameInfo.playerTwo.socketID == this.id){
        console.log("Player 2");
        this.playerNum = 2;
        io.to(this.gameInfo.playerTwo.socketID).emit('joinSuccess', gameId, 2);
        io.to(this.gameInfo.playerOne.socketID).emit('joinSuccess', gameId, 1);
      } else if(this.gameInfo.playerTwo && this.gameInfo.playerOne.socketID == this.id){
        console.log("Player 1");
        this.playerNum = 1;
        io.to(this.gameInfo.playerOne.socketID).emit('joinSuccess', gameId, 1);
      } else if(this.gameInfo.playerOne){
        io.to(this.gameInfo.playerOne.socketID).emit('gameCreated', {
          username: username,
          gameId: gameId
        });
      }
      console.log(username + " joined game: " + socket.gameInfo.id);
    }


    //request to make moves

  });

  socket.on('makeMove', function(checker, move){
    console.log("Player " + this.playerNum + ", " + this.username + " requested move");
    this.gameInfo.Game.validateMove(this.playerNum, checker, move.y, move.x);
    io.to(this.gameInfo.playerTwo.socketID).emit('madeMove', this.gameInfo.Game);
    io.to(this.gameInfo.playerOne.socketID).emit('madeMove', this.gameInfo.Game);
  });

  function alreadyInGame(socket){
    if(socket.gameInfo){
      console.log("User already has game");
      io.emit('alreadyJoined', socket.username);
      return true;
    }
    return false;
  }
  //console.log(gc);
});




module.exports = socketApi;
