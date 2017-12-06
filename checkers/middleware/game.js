const BOARDSIZE = 8;
const BLACK = 1;
const RED = 2;
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



//in progress
Game.prototype.validateMove = function(playerNum, checker, newY, newX){
  var success = 0;
  if(playerNum == BLACK && checker.y - newY < 0){
    success = this.executeMove(playerNum, checker, newY, newX, "black");
  } else if(playerNum == RED && checker.y - newY > 0){
    success = this.executeMove(playerNum, checker, newY, newX, "red");
  }
  console.log(success);
  //console.log(JSON.stringify(this));
}


Game.prototype.executeMove = function(playerNum, checker, newY, newX, color){
  if(Math.abs(checker.x - newX) == 1 &&  this.cells[newY][newX].color == "grey" && !this.checkers[newY][newX]){
    this.checkers[checker.y][checker.x] = null;
    this.cells[checker.y][checker.x].hasChecker = 0;
    checker.y = newY;
    checker.x = newX;
    this.checkers[newY][newX] = checker;
    this.cells[newY][newX].hasChecker = 1;
    return 1;
  } else if(Math.abs(checker.x - newX) == 2 && this.cells[newY][newX].color == "grey" && !this.checkers[newY][newX]){
    var skippedY = null;
    var skippedX = null;
    if(color == "black"){
      if(checker.x - newX < 0 && this.checkers[checker.y + 1][checker.x + 1]){
        skippedY = checker.y + 1;
        skippedX = checker.x + 1;
      } else if(checker.x - newX > 0 && this.checkers[checker.y + 1][checker.x - 1]){
        skippedY = checker.y + 1;
        skippedX = checker.x - 1;
      }
    } else if(color == "red"){
      if(checker.x - newX < 0 && this.checkers[checker.y - 1][checker.x + 1]){
        skippedY = checker.y - 1;
        skippedX = checker.x + 1;
      } else if(checker.x - newX > 0 && this.checkers[checker.y - 1][checker.x - 1]){
        skippedY = checker.y - 1;
        skippedX = checker.x - 1;
      }
    }

    if(skippedX && skippedY){
      this.checkers[skippedY][skippedX] = null;
      this.cells[skippedY][skippedX].hasChecker = 0;
      this.checkers[checker.y][checker.x] = null;
      this.cells[checker.y][checker.x].hasChecker = 0;
      checker.y = newY;
      checker.x = newX;
      this.checkers[newY][newX] = checker;
      this.cells[newY][newX].hasChecker = 1;
      return 1;
    }
  }
}

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

GameCollection.prototype.addGame = function(socket, player){
  var gameId = (Math.random()+1).toString(36).slice(2, 18);
  console.log("Game Created by "+ player.username + " w/ " + gameId);
  var gameInfo = new GameInfo();
  gameInfo.id = gameId;
  gameInfo.playerOne = player;
  gameInfo.Game = new Game();
  gameInfo.Game.initGame();
  //console.log(gameInfo.Game);
  this.gameList.push(gameInfo);
  this.totalGameCount++;
}


GameCollection.prototype.gameSeeker = function(socket, player){
  var openMatches = [];
  var gameNum = null;

  for(var i = 0; i < this.gameList.length; i++){
    if(this.gameList[i].playerTwo == null){
      openMatches.push(i);
    }
  }

  if((this.totalGameCount == 0) || openMatches.length == 0) {
    player.playerNum = 1;
    this.addGame(socket, player);
  } else {
    player.playerNum = 2;
    gameNum = openMatches.pop();
    if (this.gameList[gameNum]['playerTwo'] == null){
        this.gameList[gameNum]['playerTwo'] = player;
        console.log(player.username + " has been added to: " + this.gameList[gameNum].id);
    }
  }

  if(gameNum && this.gameList[gameNum]){
    return this.gameList[gameNum];
  } else{
    return this.gameList[this.gameList.length - 1];
  }
}


var gc = new GameCollection();

module.exports = gc;
