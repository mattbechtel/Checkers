const BOARDSIZE = 8;
var svgNS = "http://www.w3.org/2000/svg";
var socket = io();




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

function Game(){
  this.checkers = [...Array(BOARDSIZE).keys()].map(i => Array(BOARDSIZE));
  this.cells = [...Array(BOARDSIZE).keys()].map(i => Array(BOARDSIZE));
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
          this.renderChecker(cellID, this.checkers[i][j].color);
        }
        $(cellID).css('background-color', this.cells[i][j].color);
      }
    }
  }
}

Game.prototype.renderChecker = function(cellID, color, ){
  var xmlns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(xmlns, "svg");
  var c = document.createElementNS(svgNS,"circle"); //to create a circle. for rectangle use "rectangle"
  c.setAttributeNS(null,"id","c");
  c.setAttributeNS(null,"cx", "50%");
  c.setAttributeNS(null,"cy", "50%");
  c.setAttributeNS(null,"r", "45%");
  c.setAttributeNS(null,"fill",color);
  c.setAttributeNS(null,"stroke","none");
  svg.appendChild(c);
  $(cellID).append(svg);
}



Game.prototype.run = function(){
  $("#create").remove();
  $("#join").remove();
  $("#username").remove();
  this.initGame();
}

//welcome
$(document).ready(function(){

  $('#create').click(function(){
    sendGame();
  });

  $('#join').click(function(){
    joinGame();
  });
});

socket.on('messageFromOpponent', function(msg){
  alert(msg);
})


socket.on('gameCreated', function (data) {
    console.log("Game Created! ID is: " + data.gameId)
    console.log(data.username + ' created Game: ' + data.gameId);
    //alert("Game Created! ID is: "+ JSON.stringify(data));
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

socket.on('joinSuccess', function (gameId) {
  console.log('Joining the following game: ' + gameId);
  var game = new Game();
  game.run();
  socket.emit('messageToOpponent', "FROM OPPONENT");
});


//Response from Server on existing User found in a game
socket.on('alreadyJoined', function (username){
  console.log('You are already in an Existing Game: ' + username);
  alert("Username is already active, try another");
});


function leaveGame(){
socket.emit('leaveGame');
};

socket.on('leftGame', function (data) {
  console.log('Leaving Game ' + data.gameId);
});
