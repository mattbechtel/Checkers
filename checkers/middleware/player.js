/**
 * Player (contains data for a client)
 * @param       {string} username  Username that client entered
 * @param       {int} playerNum Player Number (relative to the game)
 * @param       {string} socketID  ID of socket that client is connected on
 * @constructor
 */
function Player(username, playerNum, socketID){
  this.username = username;
  this.playerNum = playerNum;
  this.socketID = socketID;
}

module.exports = Player;
