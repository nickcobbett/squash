var Sequelize = require('sequelize');
var sequelize = require('./db.js').sequelize;
var Player = require('./db.js').Player;
var Match = require('./db.js').Match;
var Promise = require('bluebird');

var determineWinner = (match) => {
  return match[2] > match[3] ? match[0] : match[1];
};

var createPlayers = (match) => {
  var matches = match.slice(0, 1).map(player => {
    return Player.create({'name': player});
  });

  return Promise.all(matches).then((player) => {
    console.log(player);
  }).catch(err => {
    console.log(err);
  });
};

var addOnePlayer = (name) => {
  return Player.create({name: name});
};

var addOneMatch = (match) => {
  console.log(match);
  return Match.create({
    playerOne: match.playerOne,
    playerTwo: match.playerTwo,
    playerOnePoints: match.playerOnePoints,
    playerTwoPoints: match.playerTwoPoints,
    date: match.date
  });
};

exports.determineWinner = determineWinner;
exports.createPlayers = createPlayers;
exports.addOnePlayer = addOnePlayer;
exports.addOneMatch = addOneMatch;