var socket = io();

$(document).ready(function(){
  $('#create').click(function(){
    sendGame();
  });

  $('#join').click(function(){
    joinGame();
  });
});


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
  window.location = '/checkers';
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
