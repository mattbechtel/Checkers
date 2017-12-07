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


Game.prototype.executeMove = function(playerNum, checker, newY, newX){
  var normalMove = (Math.abs(checker.x - newX) == 1 && this.cells[newX][newY] && this.cells[newY][newX].color == "grey" && !this.checkers[newY][newX]);
  var skipMove = (Math.abs(checker.x - newX) == 2 && this.cells[newX][newY] && this.cells[newY][newX].color == "grey" && !this.checkers[newY][newX]);

  if(normalMove){
    var validMoveBlack = ((checker.color == "black" && checker.y - newY < 0) || checker.isKing);
    var validMoveRed = ((checker.color == "red" && checker.y - newY > 0) || checker.isKing);

    if(validMoveBlack || validMoveRed){
      this.checkers[checker.y][checker.x] = null;
      this.cells[checker.y][checker.x].hasChecker = 0;
      checker.y = newY;
      checker.x = newX;
      this.checkers[newY][newX] = checker;
      this.cells[newY][newX].hasChecker = 1;
      if((this.cells[newY][newX].y == BOARDSIZE - 1 && checker.color == "black") || (this.cells[newY][newX].y == 0 && checker.color == "red")){
        this.checkers[newY][newX].isKing = 1;
      }
    }

  } else if(skipMove){
    var skippedY = null;
    var skippedX = null;
    if(checker.color == "black" && !checker.isKing){
      var skipRight = (checker.y - newY < 0 && checker.x - newX < 0 && this.checkers[checker.y + 1][checker.x + 1] && this.checkers[checker.y + 1][checker.x + 1].color == "red");
      var skipLeft = (checker.y - newY < 0 && checker.x - newX > 0 && this.checkers[checker.y + 1][checker.x - 1] && this.checkers[checker.y + 1][checker.x - 1].color == "red");

      if(skipRight){
        skippedY = checker.y + 1;
        skippedX = checker.x + 1;
      } else if(skipLeft){
        skippedY = checker.y + 1;
        skippedX = checker.x - 1;
      }
    } else if(checker.color == "red" && !checker.isKing){
      var skipRight = (checker.y - newY > 0 && checker.x - newX < 0 && this.checkers[checker.y - 1][checker.x + 1] && this.checkers[checker.y - 1][checker.x + 1].color == "black")
      var skipLeft = (checker.y - newY > 0 && checker.x - newX > 0 && this.checkers[checker.y - 1][checker.x - 1] && this.checkers[checker.y - 1][checker.x - 1].color == "black")

      if(skipRight){
        skippedY = checker.y - 1;
        skippedX = checker.x + 1;
      } else if(skipLeft){
        skippedY = checker.y - 1;
        skippedX = checker.x - 1;
      }
    } else if(checker.color == "black" && checker.isKing){
        var skipDownRight = (checker.x - newX < 0 && this.checkers[checker.y + 1][checker.x + 1] && this.checkers[checker.y + 1][checker.x + 1].color == "red");
        var skipDownLeft = (checker.x - newX > 0 && this.checkers[checker.y + 1][checker.x - 1] && this.checkers[checker.y + 1][checker.x - 1].color == "red");
        var skipUpRight = (checker.x - newX < 0 && this.checkers[checker.y - 1][checker.x + 1] && this.checkers[checker.y - 1][checker.x + 1].color == "red");
        var skipUpLeft = (checker.x - newX > 0 && this.checkers[checker.y - 1][checker.x - 1] && this.checkers[checker.y - 1][checker.x - 1].color == "red");

        if(skipDownRight){
          skippedY = checker.y + 1;
          skippedX = checker.x + 1;
        } else if(skipDownLeft){
          skippedY = checker.y + 1;
          skippedX = checker.x - 1;
        } else if(skipUpRight){
          skippedY = checker.y - 1;
          skippedX = checker.x + 1;
        } else if(skipUpLeft){
          skippedY = checker.y - 1;
          skippedX = checker.x - 1;
        }
    } else if(checker.color == "red" && checker.isKing){
        var skipDownRight = (checker.x - newX < 0 && this.checkers[checker.y + 1][checker.x + 1] && this.checkers[checker.y + 1][checker.x + 1].color == "black");
        var skipDownLeft = (checker.x - newX > 0 && this.checkers[checker.y + 1][checker.x - 1] && this.checkers[checker.y + 1][checker.x - 1].color == "black");
        var skipUpRight = (checker.x - newX < 0 && this.checkers[checker.y - 1][checker.x + 1] && this.checkers[checker.y - 1][checker.x + 1].color == "black");
        var skipUpLeft = (checker.x - newX > 0 && this.checkers[checker.y - 1][checker.x - 1] && this.checkers[checker.y - 1][checker.x - 1].color == "black");

        if(skipDownRight){
          skippedY = checker.y + 1;
          skippedX = checker.x + 1;
        } else if(skipDownLeft){
          skippedY = checker.y + 1;
          skippedX = checker.x - 1;
        } else if(skipUpRight){
          skippedY = checker.y - 1;
          skippedX = checker.x + 1;
        } else if(skipUpLeft){
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
      if((this.cells[newY][newX].y == BOARDSIZE - 1 && checker.color == "black") || (this.cells[newY][newX].y == 0 && checker.color == "red")){
        this.checkers[newY][newX].isKing = 1;
      }
    }
  }
}


Game.prototype.checkWin = function(){
  var blackCount = 0;
  var redCount = 0;
  for(var i = 0; i < BOARDSIZE; i++){
    for(var j = 0; j < BOARDSIZE; j++){
      if(this.checkers[i][j] && this.checkers[i][j].color == "black"){
        blackCount++;
      } else if(this.checkers[i][j] && this.checkers[i][j].color == "red"){
        redCount++;
      }
    }
  }

  if(blackCount != 0 && redCount == 0){
    return 1;
    console.log("Player One Wins");
  } else if(redCount != 0 && blackCount == 0){
    return 2;
    console.log("Player Two Wins");
  } else{
    return 0;
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
  this.turn = null;
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
    gameNum = openMatches[0];
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
