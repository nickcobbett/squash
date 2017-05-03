var Sequelize = require('sequelize');
var sequelize = require('./db.js');
var Player = require('./db.js').Player;
var Match = require('./db.js').Match;

var determineWinner = (match) => {
  return match[2] > match[3] ? match[0] : match[1];
};

var createPlayers = (match) => {
  match.slice(0, 1).map(player => {
    return Player.create({'name': player}).then((player) => {
      console.log(player.get());
    }).catch(err => {
      console.log(err);
    });
  });
};

module.exports.determineWinner = determineWinner;
module.exports.createPlayers = createPlayers;