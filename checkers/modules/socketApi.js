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
      this.gameInfo.turn = this.playerNum;
      this.gameNum = gc.gameList.length - 1;
      io.to(this.gameInfo.playerOne.socketID).emit('gameCreated', {
        username: username,
        gameId: gameId
      }, this.gameInfo.turn);
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
      this.gameNum = gc.gameList.length - 1;
      var gameId = this.gameInfo.id;

      if(this.gameInfo.playerTwo && this.gameInfo.playerTwo.socketID == this.id){
        console.log("Player 2");
        this.playerNum = 2;
        io.to(this.gameInfo.playerTwo.socketID).emit('joinSuccess', gameId, 2, this.gameInfo.turn);
        io.to(this.gameInfo.playerOne.socketID).emit('joinSuccess', gameId, 1, this.gameInfo.turn);
      } else if(this.gameInfo.playerTwo && this.gameInfo.playerOne.socketID == this.id){
        console.log("Player 1");
        this.playerNum = 1;
        io.to(this.gameInfo.playerOne.socketID).emit('joinSuccess', gameId, 1, this.gameInfo.turn);
      } else if(this.gameInfo.playerOne){
        this.playerNum = 1;
        this.gameInfo.turn = this.playerNum;
        io.to(this.gameInfo.playerOne.socketID).emit('gameCreated', {
          username: username,
          gameId: gameId
        }, this.gameInfo.turn);
      }
      console.log(username + " joined game: " + socket.gameInfo.id);
    }
  });


    //request to make moves
  socket.on('makeMove', function(checker, move){
    console.log("Player " + this.playerNum + ", " + this.username + " requested move");
    if(this.playerNum == this.gameInfo.turn){
      this.gameInfo.Game.executeMove(this.playerNum, checker, move.y, move.x);
      if(this.gameInfo.turn == 1){
        this.gameInfo.turn = 2;
      } else if(this.gameInfo.turn ==2){
        this.gameInfo.turn = 1;
      }
      io.to(this.gameInfo.playerTwo.socketID).emit('madeMove', this.gameInfo.Game, this.gameInfo.turn);
      io.to(this.gameInfo.playerOne.socketID).emit('madeMove', this.gameInfo.Game, this.gameInfo.turn);
      gc.gameList[this.gameNum].Game = this.gameInfo.Game;
    } else{
      io.to(this.id).emit('waitingForOpponentMove');
    }
  });


  socket.on('win', function(){
    if(this.gameInfo.Game.checkWin() == 1){
      io.to(this.gameInfo.playerOne.socketID).emit('youWin');
      io.to(this.gameInfo.playerTwo.socketID).emit('youLose');
      io.to(this.gameInfo.playerOne.socketID).emit('gameOver');
      io.to(this.gameInfo.playerTwo.socketID).emit('gameOver');
      gc.gameList.splice(this.gameNum, 1);
    } else if(this.gameInfo.Game.checkWin() == 2){
      io.to(this.gameInfo.playerTwo.socketID).emit('youWin');
      io.to(this.gameInfo.playerOne.socketID).emit('youLose');
      io.to(this.gameInfo.playerTwo.socketID).emit('gameOver');
      io.to(this.gameInfo.playerOne.socketID).emit('gameOver');
      gc.gameList.splice(this.gameNum, 1);
    }
  });


  socket.on('disconnect', function () {
    if(this.gameInfo){
      if(this.gameInfo.playerOne && this.gameInfo.playerTwo){
        io.to(this.gameInfo.playerTwo.socketID).emit('leftGame');
        io.to(this.gameInfo.playerOne.socketID).emit('leftGame');
      } else if(this.gameInfo.playerOne){
       io.to(this.gameInfo.playerOne.socketID).emit('leftGame');
      }
      gc.gameList.splice(this.gameNum, 1);
    }
 });


  function alreadyInGame(socket){
    if(socket.gameInfo){
     console.log("User already has game");
     io.emit('alreadyJoined', socket.username);
     return true;
    }
    return false;
  }
});


module.exports = socketApi;
