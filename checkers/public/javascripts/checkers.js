const BOARDSIZE = 8;
var svgNS = "http://www.w3.org/2000/svg";
var socket = io();
const BLACK = 1;
const RED = 2;
var thisGame;


function Checker(x, y, color){
  this.x = x;
  this.y = y;
  this.color = color;
  this.isKing = 0;
  this.alive = 1;
}

function Cell(x, y, color){
  this.x = x;
  this.y = y;
  this.color = color;
  this.hasChecker = 0;
}

function Game(player){
  this.checkers = [...Array(BOARDSIZE).keys()].map(i => Array(BOARDSIZE));
  this.cells = [...Array(BOARDSIZE).keys()].map(i => Array(BOARDSIZE));
  this.player = player;
}




Game.prototype.initGame = function () {
  this.setupBoard();
  var checkerColor = "grey";
  var cellColor = "white";

  for(var i = 0; i < BOARDSIZE; i++){
    for(var j = 0; j < BOARDSIZE; j++){
      if(i > BOARDSIZE/2){
        checkerColor = "red";
      } else if(i < (BOARDSIZE/2) - 1){
        checkerColor = "black";
      } else{
        checkerColor = "grey"
      }

      if(i % 2 == 0){
        if(j % 2 == 0){
          cellColor = "white";
        } else{
          cellColor = "grey";
        }
      } else{
        if(j % 2 == 0){
          cellColor = "grey";
        } else{
          cellColor = "white";
        }
      }

      this.cells[i][j] = new Cell(j, i, cellColor);

      if(cellColor == "grey"){
        if(checkerColor != "grey"){
          this.checkers[i][j] = new Checker(j, i, checkerColor);
          this.cells[i][j].hasChecker = 1;
        } else{
          this.checkers[i][j] = null;
        }
      } else{
        this.checkers[i][j] = null;
      }
    }
  }
  console.log(this.checkers, this.cells);
  this.renderBoard();
};


Game.prototype.setupBoard = function(){
  for(var i = 0; i < BOARDSIZE; i++){
    var row = document.createElement('tr');
    row.id = "row" + i;
    for(var j = 0; j < BOARDSIZE; j++){
      var cell = document.createElement('td');
      cell.id = "row" + i + "col" + j;

      if(i % 2 == 0 && j % 2 != 0){
        cell.onclick = function(id, y, x, game){
          return function(){
            displayPossibleMoves(id, y, x, game);
          }
        }(cell.id, i, j, this);
      } else if(i % 2 != 0 && j % 2 == 0){
        cell.onclick = function(id, y, x, game){
          return function(){
            displayPossibleMoves(id, y, x, game);
          }
        }(cell.id, i, j, this);
      }

      row.appendChild(cell);
    }
    $('#game').append(row);
  }
}


Game.prototype.renderBoard = function(){
  for(var i = 0; i < BOARDSIZE; i++){
    for(var j = 0; j < BOARDSIZE; j++){
      if(this.cells[i][j].color == "grey"){
        var cellID = "#row" + i + "col" + j;
        if(this.cells[i][j].hasChecker){
          this.renderChecker(cellID, this.checkers[i][j].color, this.checker[i][j].isKing);
        }
        $(cellID).css('background-color', this.cells[i][j].color);
      }
    }
  }
}

Game.prototype.renderChecker = function(cellID, color, isKing){
  var xmlns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(xmlns, "svg");
  var c = document.createElementNS(svgNS,"circle"); //to create a circle. for rectangle use "rectangle"
  if(!isKing){
    c.setAttributeNS(null,"id", cellID + "circle");
    c.setAttributeNS(null,"cx", "50%");
    c.setAttributeNS(null,"cy", "50%");
    c.setAttributeNS(null,"r", "45%");
    c.setAttributeNS(null,"fill",color);
    c.setAttributeNS(null,"stroke","none");
  } else{
    c.textContent("K");
    c.setAttributeNS(null,"id","c");
    c.setAttributeNS(null,"cx", "50%");
    c.setAttributeNS(null,"cy", "50%");
    c.setAttributeNS(null,"r", "45%");
    c.setAttributeNS(null,"fill",color);
    c.setAttributeNS(null,"stroke",6);
  }

  svg.appendChild(c);
  $(cellID).append(svg);
}


Game.prototype.run = function(){
  $("#loading").text("");
  this.initGame();
}


function displayPossibleMoves(cellID, checkerY, checkerX, game){
  //alert(cellID);
  var moves;
  if(game.checkers[checkerY][checkerX]){
    moves = calculatePossibleMoves(checkerY, checkerX, game);
    //alert(JSON.stringify(moves));
    for(var i = 0; i < moves.length; i++){
      var cellID = "row" + moves[i].y + "col" + moves[i].x;
      var cell = document.getElementById(cellID);
      if(game.player == BLACK){
        cell.style.backgroundColor = "black";
      } else if(game.player == RED){
        cell.style.backgroundColor = "red";
      }
      cell.onclick = function(cellID, moves, i, checker){
        return function(){
          makeMove(cellID, moves, i, checker);
        }
      }(cellID, moves, i, game.checkers[checkerY][checkerX]);
    }
  }
}

function calculatePossibleMoves(checkerY, checkerX, game){
  var possibleMoves = [];
  var black = (game.player == BLACK && game.checkers[checkerY][checkerX] && game.checkers[checkerY][checkerX].color == "black" && !game.checkers[checkerY][checkerX].isKing);
  var red = (game.player == RED && game.checkers[checkerY][checkerX] && game.checkers[checkerY][checkerX].color == "red" && !game.checkers[checkerY][checkerX].isKing);
  var blackKing = (game.player == BLACK && game.checkers[checkerY][checkerX] && game.checkers[checkerY][checkerX].color == "black" && game.checkers[checkerY][checkerX].isKing);
  var redKing = (game.player == RED && game.checkers[checkerY][checkerX] && game.checkers[checkerY][checkerX].isKing);

  if(black){ //black, not a king
    for(var i = -1; i < 2; i+=2){
      var regularMove = (!game.checkers[checkerY + 1][checkerX + i] && checkerX + i >= 0 && checkerX + i < BOARDSIZE);
      var skipMove = (game.checkers[checkerY + 1][checkerX + i] && game.checkers[checkerY + 1][checkerX + i].color == "red" && !game.checkers[checkerY + 2][checkerX + 2*i]);

      if(regularMove){
        possibleMoves.push({y: checkerY + 1, x: checkerX + i});
      } else if(skipMove){
        possibleMoves.push({y: checkerY + 2, x: checkerX + 2*i});
      }
    }
  } else if(red){ //red, not a king
    for(var i = -1; i < 2; i+=2){
      var regularMove = (!game.checkers[checkerY - 1][checkerX + i] && checkerX + i >= 0 && checkerX + i < BOARDSIZE);
      var skipMove = (game.checkers[checkerY - 1][checkerX + i] && game.checkers[checkerY - 1][checkerX + i].color == "black" && !game.checkers[checkerY - 2][checkerX + 2*i] && checkerX + 2*i >= 0);

      if(regularMove){
        possibleMoves.push({y: checkerY - 1, x: checkerX + i});
      } else if(skipMove){
        possibleMoves.push({y: checkerY - 2, x: checkerX + 2*i});
      }
    }
  } else if(blackKing){ //black, a king
    for(var i = -1; i < 2; i+=2){
      var regularMove = (!game.checkers[checkerY - 1][checkerX + i] && checkerX + i >= 0 && checkerX + i < BOARDSIZE);
      var skipMove = (game.checkers[checkerY - 1][checkerX + i] && game.checkers[checkerY - 1][checkerX + i].color == "red" && !game.checkers[checkerY - 2][checkerX + 2*i] && checkerX + 2*i >= 0);

      if(regularMove){
        possibleMoves.push({y: checkerY - 1, x: checkerX + i});
      } else if(skipMove){
        possibleMoves.push({y: checkerY - 2, x: checkerX + 2*i});
      }
    }
  } else if(redKing){ //red, a king

  } else{
    if(game.player == BLACK){
      alert("Choose a black checker")
    } else if(game.player == RED){
      alert("Choose a red checker");
    }
  }

  return possibleMoves;
}


function makeMove(cellID, moves, i, checker){
  for(var j = 0; j < moves.length; j++){
    $("#row" + moves[j].y + "col" + moves[j].x).css('background-color', "grey");
  }
  //alert(checker.y + " "  + checker.x + " made move to " + moves[i].y + " " + moves[i].x);
  socket.emit('makeMove', checker, moves[i]);
}






//SOCKET REQUESTS (matchmaking)
$(document).ready(function(){
  $('#create').click(function(){
    sendGame();
  });

  $('#join').click(function(){
    joinGame();
  });
});


function sendGame(){
  if($("#username").val() != ""){
    socket.emit('makeGame', $("#username").val());
  } else{
    alert("Please enter a username");
  }
}


function joinGame(){
  socket.emit('joinGame', $('#username').val());
};

function leaveGame(){
  socket.emit('leaveGame');
};


socket.on('messageFromOpponent', function(msg){
  alert(msg);
});


socket.on('gameCreated', function (data) {
  console.log("Game Created! ID is: " + data.gameId)
  console.log(data.username + ' created Game: ' + data.gameId);
  //alert("Game Created! ID is: "+ JSON.stringify(data));
  $("#create").remove();
  $("#join").remove();
  $("#username").remove();
  $("#loading").text("Waiting for oppenent");
});


socket.on('joinSuccess', function (gameId, player) {
  console.log('Joining the following game: ' + gameId);
  $("#create").remove();
  $("#join").remove();
  $("#username").remove();
  thisGame = new Game(player);
  thisGame.run();
  socket.emit('messageToOpponent', "FROM OPPONENT");
});


//Response from Server on existing User found in a game
socket.on('alreadyJoined', function (username){
  console.log('You are already in an Existing Game ' + username + "!");
  alert("Username is already active, try another");
});


socket.on('leftGame', function (data) {
  console.log('Leaving Game ' + data.gameId);
});


socket.on('madeMove', function(game){
  console.log(JSON.stringify(game));
  $("#game").remove();
  var board = document.createElement('table');
  board.id = "game";
  $("#gameDiv").append(board);
  thisGame.checkers = game.checkers;
  thisGame.cells = game.cells;
  thisGame.setupBoard();
  thisGame.renderBoard();
});
