const BOARDSIZE = 8;
var svgNS = "http://www.w3.org/2000/svg";

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
  this.checkers = new Array([]);
  this.cells = new Array();

  for(var i = 0; i < BOARDSIZE; i++){
    this.checkers.push(new Array());
    this.cells.push(new Array());
  }

}

Game.prototype.initGame = function () {
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
};



function GameCollection(){
  this.totalGameCount = 0;
  this.gameList = [];
}

function GameInfo(){
  this.id = null;
  this.playerOne = null;
  this.playerTwo = null;
  this.Game = null;
}

GameCollection.prototype.addGame = function(socket, username){
  var gameId = (Math.random()+1).toString(36).slice(2, 18);
  console.log("Game Created by "+ username + " w/ " + gameId);
  var gameInfo = new GameInfo();
  gameInfo.id = gameId;
  gameInfo.playerOne = username;
  gameInfo.Game = new Game();
  gameInfo.Game.initGame();
  console.log(gameInfo.Game);
  this.gameList.push(gameInfo);
  this.totalGameCount++;
}


GameCollection.prototype.gameSeeker = function(socket, username){
  var openMatches = [];

  for(var i = 0; i < this.gameList.length; i++){
    if(this.gameList[i].playerTwo == null){
      openMatches.push(i);
    }
  }

  if((this.totalGameCount == 0) || openMatches.length == 0) {
    this.addGame(socket, username);
  } else {
    var gameNum = openMatches.pop();
    if (this.gameList[gameNum]['playerTwo'] == null){
        this.gameList[gameNum]['playerTwo'] = username;
        console.log(username + " has been added to: " + this.gameList[gameNum].id);
    }
  }

  if(this.gameList[gameNum].id){
    return this.gameList[gameNum].id;
  }
}


var gc = new GameCollection();

module.exports = gc;
