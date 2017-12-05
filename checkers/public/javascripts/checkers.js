const BOARDSIZE = 8;
var svgNS = "http://www.w3.org/2000/svg";
var socket = io();

$(window).on('load', function(){
  var game = new Game();
  game.run();
});


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
  var checkerColor = "black";
  var cellColor = "white";

  for(var i = 0; i < BOARDSIZE; i++){
    for(var j = 0; j < BOARDSIZE; j++){
      if(i > (BOARDSIZE - 1)/2){
        checkerColor = "red";
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
        this.checkers[i][j] = new Checker(j, i, checkerColor);
        this.cells[i][j].hasChecker = 1;
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
      if(this.cells[i][j].hasChecker){
        var cellID = "#row" + i + "col" + j;
        this.renderChecker(cellID, this.checkers[i][j].color);
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
  c.setAttributeNS(null,"r", "25%");
  c.setAttributeNS(null,"fill",color);
  c.setAttributeNS(null,"stroke","none");
  svg.appendChild(c);
  $(cellID).append(svg);
}



Game.prototype.run = function(){
  this.initGame();
}
