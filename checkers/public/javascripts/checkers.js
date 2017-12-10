const BOARDSIZE = 8;
var svgNS = "http://www.w3.org/2000/svg";
var socket = io();
const BLACK = 1;
const RED = 2;
var thisGame;

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
 * @param {Player} player client info stored in player object
 * @constructor
 */
function Game(player){
  this.checkers = [...Array(BOARDSIZE).keys()].map(i => Array(BOARDSIZE));
  this.cells = [...Array(BOARDSIZE).keys()].map(i => Array(BOARDSIZE));
  this.player = player;
}


/**
 * Game initialization
 */
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
  this.renderBoard();
};


/**
 * Sets up DOM for checkerboard
 */
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


/**
 * Renders board to DOM based on the checkers and cells fields of the Game objectS
 */
Game.prototype.renderBoard = function(){
  for(var i = 0; i < BOARDSIZE; i++){
    for(var j = 0; j < BOARDSIZE; j++){
      if(this.cells[i][j].color == "grey"){
        var cellID = "#row" + i + "col" + j;
        if(this.cells[i][j].hasChecker){
          this.renderChecker(cellID, this.checkers[i][j].color, this.checkers[i][j].isKing);
        }
        $(cellID).css('background-color', this.cells[i][j].color);
      }
    }
  }
}


/**
 * Renders checker to DOM
 * @param  {string}  cellID ID for cell that checker is in, formatted for jquery ("#...")
 * @param  {string}  color  Color of checker
 * @param  {Boolean} isKing Whether or not the checker is a king
 */
Game.prototype.renderChecker = function(cellID, color, isKing){
  var xmlns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(xmlns, "svg");
  var c = document.createElementNS(svgNS,"circle"); //to create a circle. for rectangle use "rectangle
  if(!isKing){
    c.setAttributeNS(null,"id", cellID + "circle");
    c.setAttributeNS(null,"cx", "50%");
    c.setAttributeNS(null,"cy", "50%");
    c.setAttributeNS(null,"r", "45%");
    c.setAttributeNS(null,"fill",color);
    c.setAttributeNS(null,"stroke","none");
    svg.appendChild(c);
  } else{
    svg.innerHTML ='<g><circle id="#row0col7circle" cx="50%" cy="50%" r="45%" fill="'+color+'" stroke="6"></circle><text fill="white" text-anchor="middle" x="50%" y="65%">K</text></g>';
  }
  $(cellID).append(svg);
}


/**
 * Runs game
 */
Game.prototype.run = function(){
  $("#loading").text("");
  this.initGame();
}


/**
 * Diplay the possible moves of selected checker
 * @param  {string} cellID   Cell ID of checker, formatted for jquery
 * @param  {int} checkerY Y coordinate of checker
 * @param  {int} checkerX X coordinate of checker
 * @param  {Game} game     Game object holding info for this game
 */
function displayPossibleMoves(cellID, checkerY, checkerX, game){
  var moves;
  if(game.checkers[checkerY][checkerX]){
    moves = calculatePossibleMoves(checkerY, checkerX, game);
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


/**
 * Calculates possible moves and returns them
 * @param  {int} checkerY Y coordinate of checker
 * @param  {int} checkerX X coordinate of checker
 * @param  {Game} game     Game object holding info for this game
 * @return {[{y: int, x: int}, ...,]}  possibleMoves   Array of "move" objects, {y: int, x: int}
 */
function calculatePossibleMoves(checkerY, checkerX, game){
  var possibleMoves = [];

  if(checkType(checkerY, checkerX, game, "black")){ //black, not a king
    for(var i = -1; i < 2; i+=2){
      if(checkMove(checkerY, checkerX, game, "regularMoveBlack", i)){
        possibleMoves.push({y: checkerY + 1, x: checkerX + i});
      } else if(checkMove(checkerY, checkerX, game, "skipMoveBlack", i)){
        possibleMoves.push({y: checkerY + 2, x: checkerX + 2*i});
      }
    }
  } else if(checkType(checkerY, checkerX, game, "red")){ //red, not a king
    for(var i = -1; i < 2; i+=2){
      if(checkMove(checkerY, checkerX, game, "regularMoveRed", i)){
        possibleMoves.push({y: checkerY - 1, x: checkerX + i});
      } else if(checkMove(checkerY, checkerX, game, "skipMoveRed", i)){
        possibleMoves.push({y: checkerY - 2, x: checkerX + 2*i});
      }
    }
  } else if(checkType(checkerY, checkerX, game, "blackKing")){ //black, a king
    possibleMoves = possibleKingMoves(checkerY, checkerX, game, "red");
  } else if(checkType(checkerY, checkerX, game, "redKing")){ //red, a king
    possibleMoves = possibleKingMoves(checkerY, checkerX, game, "black");
  } else{
    if(game.player == BLACK){
      alert("Choose a black checker");
    } else if(game.player == RED){
      alert("Choose a red checker");
    }
  }

  return possibleMoves;
}


/**
 * Checks type of checker
 * @param  {int} checkerY Y coordinate of checker to be moved
 * @param  {int} checkerX X coordinate of checker to be moved
 * @param  {Game} game    Game object containing info for this game
 * @param  {string} type     type of move
 * @return {boolean}         true if checker is of specified type, false otherwise
 */
function checkType(checkerY, checkerX, game, type){
  switch(type){
    case "black":
      return (game.player == BLACK && game.checkers[checkerY][checkerX] && game.checkers[checkerY][checkerX].color == "black" && !game.checkers[checkerY][checkerX].isKing);
    case "red":
      return (game.player == RED && game.checkers[checkerY][checkerX] && game.checkers[checkerY][checkerX].color == "red" && !game.checkers[checkerY][checkerX].isKing);
    case "blackKing":
      return (game.player == BLACK && game.checkers[checkerY][checkerX] && game.checkers[checkerY][checkerX].color == "black" && game.checkers[checkerY][checkerX].isKing);
    case "redKing":
      return (game.player == RED && game.checkers[checkerY][checkerX] &&  game.checkers[checkerY][checkerX].color == "red" && game.checkers[checkerY][checkerX].isKing);
    default:
      return false;
  }
}


/**
 * Check move of specified type of checker
 * @param  {int} checkerY Y coordinate of checker to be moved
 * @param  {int} checkerX X coordinate of checker to be moved
 * @param  {Game} game    Game object containing info for this game
 * @param  {string} type     type of move
 * @param  {int} i offset of move
 * @return {boolean}         true if move is viable, false otherwise
*/
function checkMove(checkerY, checkerX, game, type, i){
  switch(type){
    case "regularMoveBlack":
      return (!game.checkers[checkerY + 1][checkerX + i]  && game.cells[checkerY + 1][checkerX + i] && checkerX + i >= 0 && checkerX + i < BOARDSIZE);
    case "regularMoveRed":
      return (!game.checkers[checkerY - 1][checkerX + i] && game.cells[checkerY - 1][checkerX + i] && checkerX + i >= 0 && checkerX + i < BOARDSIZE);
    case "skipMoveBlack":
      return (!checkMove(checkerY, checkerX, game, "regularMoveBlack", i) && checkerY + 2 < BOARDSIZE && checkerX + 2*i < BOARDSIZE && checkerX + 2*i >= 0 && game.checkers[checkerY + 1][checkerX + i] && game.checkers[checkerY + 1][checkerX + i].color == "red" && !game.checkers[checkerY + 2][checkerX + 2*i]);
    case "skipMoveRed":
      return (!checkMove(checkerY, checkerX, game, "regularMoveRed", i) && checkerY - 2 >= 0 && checkerX + 2*i < BOARDSIZE && checkerX + 2*i >= 0 && game.checkers[checkerY - 1][checkerX + i] && game.checkers[checkerY - 1][checkerX + i].color == "black" && !game.checkers[checkerY - 2][checkerX + 2*i]);
    default:
      return false;
  }
}


/**
 * Helper function for calculatePossibleMoves. Checks possible moves for kings and returns them
 * @param  {int} checkerY Y coordinate of checker
 * @param  {int} checkerX X coordinate of checker
 * @param  {Game} game     Game object holding info for this game
 * @param {string} color Color of checker
 * @return {[{y: int, x: int}, ...,]}  possibleMoves   Array of "move" objects, {y: int, x: int}
 */
function possibleKingMoves(checkerY, checkerX, game, color){
  var possibleMoves = [];
  for(var i = -1; i < 2; i+=2){
    for(var j = -1; j < 2; j+=2){
      var regularMove = (checkerY + j >= 0 && checkerY + j < BOARDSIZE && checkerX + i >= 0 && checkerX + i < BOARDSIZE && game.checkers[checkerY + j] && !game.checkers[checkerY + j][checkerX + i] );
      var skipMove = (!regularMove && checkerY + 2*j >= 0 && checkerY + 2*j < BOARDSIZE && checkerX + 2*i >= 0 && checkerX + 2*i < BOARDSIZE  &&
                      game.cells[checkerY + 2*j][checkerX + 2*i] && game.checkers[checkerY + j][checkerX + i] && game.checkers[checkerY + j][checkerX + i].color == color && !game.checkers[checkerY + 2*j][checkerX + 2*i]);

      if(regularMove){
        possibleMoves.push({y: checkerY + j, x: checkerX + i});
      } else if(skipMove){
        possibleMoves.push({y: checkerY + 2*j, x: checkerX + 2*i});
      }
    }
  }
  return possibleMoves;
}


/**
 * Renders the made move. Sends requested move to server
 * @param  {string} cellID  Cell ID of checker, formatted for jquery
 * @param  {[{y: int, x: int}, ...,]} moves   Array of Possible Moves
 * @param  {int} i       Index of made move in moves array
 * @param  {Checker} checker Checker being moved
 */
function makeMove(cellID, moves, i, checker){
  for(var j = 0; j < moves.length; j++){
    $("#row" + moves[j].y + "col" + moves[j].x).css('background-color', "grey");
  }
  socket.emit('makeMove', checker, moves[i]);
}




//SOCKET REQUESTS (matchmaking)
/**
 * Sets up buttons upon ready document
 */
$(document).ready(function(){
  $('#create').click(function(){
    createGame();
  });

  $('#join').click(function(){
    joinGame();
  });
});


/**
 * If the client has entered a username this function makes the request to make a game through the socket
 */
function createGame(){
  if($("#username").val() != ""){
    socket.emit('makeGame', $("#username").val());
  } else{
    alert("Please enter a username");
  }
}


/**
 * If the client has entered a username this function makes the request to join a game through the socket
 */
function joinGame(){
  if($("#username").val() != ""){
    socket.emit('joinGame', $('#username').val());
  } else{
    alert("Please enter a username");
  }
};


/**
 * Checks if there was a win
 * @param  {Game} game Game object containing information for the game that the win is to be checked on
 * @return {[type]}      [description]
 */
function checkWin(game){
  var blackCount = 0;
  var redCount = 0;
  for(var i = 0; i < BOARDSIZE; i++){
    for(var j = 0; j < BOARDSIZE; j++){
      if(game.checkers[i][j] && game.checkers[i][j].color == "black"){
        blackCount++;
      } else if(game.checkers[i][j] && game.checkers[i][j].color == "red"){
        redCount++;
      }
    }
  }
  if(blackCount == 0 || redCount == 0){
    return 1;
  } else{
    return 0;
  }
}


/**
 * Displays whose turn it is
 * @param  {int} turn 1 for Black, 2 for Red
 */
function printTurn(turn){
  if(thisGame){
    if(turn == thisGame.player){
      $("#turn").text("Your Turn");
    } else{
      $("#turn").text("Opponent's Turn");
    }
  }
}


/**
 * Socket protocol for 'gameCreated' response from server
 * @param  {data} data
 * @param  {int} turn 1 for Black, 2 for Red
 */
socket.on('gameCreated', function (data, turn) {
  console.log("Game Created! ID is: " + data.gameId)
  console.log(data.username + ' created Game: ' + data.gameId);
  $("#create").remove();
  $("#join").remove();
  $("#username").remove();
  $("#loading").text("Waiting for oppenent...");
  printTurn(turn);
});


/**
 * Socket protocol for 'joinSuccess' response from server
 * @param  {string} gameId Game ID
 * @param  {Player} player Player object containing clients information
 * @param  {int} turn 1 for Black, 2 for Red
 */
socket.on('joinSuccess', function (gameId, player, turn) {
  console.log('Joining the following game: ' + gameId);
  $("#create").remove();
  $("#join").remove();
  $("#username").remove();
  thisGame = new Game(player);
  thisGame.run();
  printTurn(turn);
});


/**
 * Socket protocol for 'aleradyJoined' response from server, simply creates an alert
 * @param  {string} username Username of client who had already joined
 */
socket.on('alreadyJoined', function (username){
  console.log('You are already in an Existing Game ' + username + "!");
  alert("Username is already active, try another");
});


/**
 * Socket protocol for 'leftGame' response from server
 */
socket.on('leftGame', function () {
  alert("Opponent left match");
  location.reload();
});


/**
 * Socket protocol for 'madeMove' response from server upon successful move
 * @param  {Game} game Updated game state
 * @param  {int} turn 1 for Black, 2 for Red
 */
socket.on('madeMove', function(game, turn){
  $("#game").remove();
  var board = document.createElement('table');
  board.id = "game";
  $("#gameDiv").append(board);
  thisGame.checkers = game.checkers;
  thisGame.cells = game.cells;
  thisGame.setupBoard();
  thisGame.renderBoard();
  printTurn(turn);
  if(checkWin(game)){
    socket.emit('win');
  }
});



/**
 * Socket protocol for 'waitingForOpponentMove' response from server
 */
socket.on('waitingForOpponentMove', function(){
  alert("Not your move, wait for opponent");
});


/**
 * Socket protocol for 'youWin' response from server, upon a win by this client
 */
socket.on('youWin', function(){
  alert("YOU WIN");
});


/**
 * Socket protocol for 'youLose' response from server, upon a loss by the client
 * @return {[type]} [description]
 */
socket.on('youLose', function(){
  alert("YOU LOST :(");
});


/**
 * Socket protocol for 'gameOver' response from server, ends game
 */
socket.on('gameOver', function(){
  location.reload();
});
