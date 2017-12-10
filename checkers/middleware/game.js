const BOARDSIZE = 8;
const BLACK = 1;
const RED = 2;
var svgNS = "http://www.w3.org/2000/svg";

/**
 * Checker
 * @param       {int} x     x coordinate
 * @param       {int} y     y coordinate
 * @param       {string} color color of checker
 * @constructor
 */
function Checker(x, y, color){
  this.x = x;
  this.y = y;
  this.color = color;
  this.isKing = 0;
  this.alive = 1;
}


/**
 * Cell of checker board
 * @param       {int} x     x coordinate
 * @param       {int} y     y coordinate
 * @param       {string} color color of cell
 * @constructor
 */
function Cell(x, y, color){
  this.x = x;
  this.y = y;
  this.color = color;
  this.hasChecker = 0;
}


/**
 * Game consisting of checkers and cells
 * @constructor
 */
function Game(){
  this.checkers = new Array([]);
  this.cells = new Array();

  for(var i = 0; i < BOARDSIZE; i++){
    this.checkers.push(new Array());
    this.cells.push(new Array());
  }
}


/**
 * Game initialization
 */
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


/**
 * Execute move sent from the client on the server side version of the game board. Validates the move
 * @param  {int} playerNum Player number
 * @param  {Checker} checker   checker that move was requested on
 * @param  {int} newY      Y coordinate of move
 * @param  {int} newX      X coordinate of move
 */
Game.prototype.executeMove = function(playerNum, checker, newY, newX){
  if(this.checkMove(checker, newY, newX, "normal")){
    if((playerNum == BLACK && this.checkMove(checker, newY, newX, "validNormalMoveBlack")) || (playerNum == RED && this.checkMove(checker, newY, newX, "validNormalMoveRed"))){
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

  } else if(this.checkMove(checker, newY, newX, "skip")){
    var skippedY = null;
    var skippedX = null;
    if(checker.color == "black" && !checker.isKing && playerNum == BLACK){
      if(this.checkMove(checker, newY, newX, "skipRightBlack")){
        skippedY = checker.y + 1;
        skippedX = checker.x + 1;
      } else if(this.checkMove(checker, newY, newX, "skipLeftBlack")){
        skippedY = checker.y + 1;
        skippedX = checker.x - 1;
      }
    } else if(checker.color == "red" && !checker.isKing && playerNum == RED){
      if(this.checkMove(checker, newY, newX, "skipRightRed")){
        skippedY = checker.y - 1;
        skippedX = checker.x + 1;
      } else if(this.checkMove(checker, newY, newX, "skipLeftRed")){
        skippedY = checker.y - 1;
        skippedX = checker.x - 1;
      }
    } else if(checker.color == "black" && checker.isKing && playerNum == BLACK){
      if(this.checkMove(checker, newY, newX, "skipDownRightBlackKing")){
        skippedY = checker.y + 1;
        skippedX = checker.x + 1;
      } else if(this.checkMove(checker, newY, newX, "skipDownLeftBlackKing")){
        skippedY = checker.y + 1;
        skippedX = checker.x - 1;
      } else if(this.checkMove(checker, newY, newX, "skipUpRightBlackKing")){
        skippedY = checker.y - 1;
        skippedX = checker.x + 1;
      } else if(this.checkMove(checker, newY, newX, "skipUpLeftBlackKing")){
        skippedY = checker.y - 1;
        skippedX = checker.x - 1;
      }
    } else if(checker.color == "red" && checker.isKing && playerNum == RED){
      if(this.checkMove(checker, newY, newX, "skipDownRightRedKing")){
        skippedY = checker.y + 1;
        skippedX = checker.x + 1;
      } else if(this.checkMove(checker, newY, newX, "skipDownRightRedKing")){
        skippedY = checker.y + 1;
        skippedX = checker.x - 1;
      } else if(this.checkMove(checker, newY, newX, "skipUpRightRedKing")){
        skippedY = checker.y - 1;
        skippedX = checker.x + 1;
      } else if(this.checkMove(checker, newY, newX, "skipUpLeftRedKing")){
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


/**
 * Checks is said move is valid. (Helper method for executeMove)
 * @param  {Checker} checker   checker that move was requested on
 * @param  {int} newY      Y coordinate of move
 * @param  {int} newX      X coordinate of move
 * @param  {string} type string based on type of move that check was requested on
 * @return {boolean} Boolean value based on whether specified move is valid
 */
Game.prototype.checkMove = function(checker, newY, newX, type){
  switch(type){
    case "normal":
      return (Math.abs(checker.x - newX) == 1 && this.cells[newX] && this.cells[newX][newY] && this.cells[newY][newX].color == "grey" && !this.checkers[newY][newX]);
    case "skip":
      return (Math.abs(checker.x - newX) == 2 && this.cells[newX] && this.cells[newX][newY] && this.cells[newY][newX].color == "grey" && !this.checkers[newY][newX]);
    case "validNormalMoveBlack":
      return ((checker.color == "black" && checker.y - newY < 0) || checker.isKing);
    case "validNormalMoveRed":
      return ((checker.color == "red" && checker.y - newY > 0) || checker.isKing);
    case "skipRightBlack":
      return (checker.y - newY < 0 && checker.x - newX < 0 && this.checkers[checker.y + 1] && this.checkers[checker.y + 1][checker.x + 1] && this.checkers[checker.y + 1][checker.x + 1].color == "red");
    case "skipLeftBlack":
      return (checker.y - newY < 0 && checker.x - newX > 0 && this.checkers[checker.y + 1] && this.checkers[checker.y + 1][checker.x - 1] && this.checkers[checker.y + 1][checker.x - 1].color == "red");
    case "skipRightRed":
      return (checker.y - newY > 0 && checker.x - newX < 0 && this.checkers[checker.y - 1] && this.checkers[checker.y - 1][checker.x + 1] && this.checkers[checker.y - 1][checker.x + 1].color == "black");
    case "skipLeftRed":
      return (checker.y - newY > 0 && checker.x - newX > 0 && this.checkers[checker.y - 1] && this.checkers[checker.y - 1][checker.x - 1] && this.checkers[checker.y - 1][checker.x - 1].color == "black");
    case "skipDownRightBlackKing":
      return (checker.x - newX < 0 && this.checkers[checker.y + 1] && this.checkers[checker.y + 1][checker.x + 1] && this.checkers[checker.y + 1][checker.x + 1].color == "red");
    case "skipDownLeftBlackKing":
      return (checker.x - newX > 0 && this.checkers[checker.y + 1] && this.checkers[checker.y + 1][checker.x - 1] && this.checkers[checker.y + 1][checker.x - 1].color == "red");
    case "skipUpRightBlackKing":
      return (checker.x - newX < 0 && this.checkers[checker.y - 1] && this.checkers[checker.y - 1][checker.x + 1] && this.checkers[checker.y - 1][checker.x + 1].color == "red");
    case "skipUpLeftBlackKing":
      return (checker.x - newX > 0 && this.checkers[checker.y - 1] && this.checkers[checker.y - 1][checker.x - 1] && this.checkers[checker.y - 1][checker.x - 1].color == "red");
    case "skipDownRightRedKing":
      return (checker.x - newX < 0 && this.checkers[checker.y + 1] && this.checkers[checker.y + 1][checker.x + 1] && this.checkers[checker.y + 1][checker.x + 1].color == "black");
    case "skipDownLeftRedKing":
      return (checker.x - newX > 0 && this.checkers[checker.y + 1] && this.checkers[checker.y + 1][checker.x - 1] && this.checkers[checker.y + 1][checker.x - 1].color == "black");
    case "skipUpRightRedKing":
      return (checker.x - newX < 0 && this.checkers[checker.y - 1] &&this.checkers[checker.y - 1][checker.x + 1] && this.checkers[checker.y - 1][checker.x + 1].color == "black");
    case "skipUpLeftRedKing":
      return (checker.x - newX > 0 && this.checkers[checker.y - 1] && this.checkers[checker.y - 1][checker.x - 1] && this.checkers[checker.y - 1][checker.x - 1].color == "black");
    default:
      return false;
  }
}


/**
 * Check if there is a win in the game.
 * @return {int} 1 for Black win, 2 for Red win, 0 for no win
 */
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


/**
 * GameCollection (holds all current game's gameInfo and manages matchmaking)
 * @constructor
 */
function GameCollection(){
  this.totalGameCount = 0;
  this.gameList = [];
}


/**
 * GameInfo (information for a single game)
 * @constructor
 */
function GameInfo(){
  this.id = null;
  this.playerOne = null;
  this.playerTwo = null;
  this.Game = null;
  this.turn = null;
}


/**
 * Adds game. Creates GameInfo object and places that in the GameCollection's gameList
 * @param  {Socket} socket socket of client who made request to create game
 * @param  {Player} player Player object that contains data for client who requested to create the game
 */
GameCollection.prototype.addGame = function(socket, player){
  var gameId = (Math.random()+1).toString(36).slice(2, 18);
  console.log("Game Created by "+ player.username + " w/ " + gameId);
  var gameInfo = new GameInfo();
  gameInfo.id = gameId;
  gameInfo.playerOne = player;
  gameInfo.Game = new Game();
  gameInfo.Game.initGame();
  this.gameList.push(gameInfo);
  this.totalGameCount++;
}


/**
 * Searches for an open match for client, if none is found that client will be placed in a new game
 * @param  {Socket} socket socket of client who made request to create game
 * @param  {Player} player Player object that contains data for client who requested to create the game
 */
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
