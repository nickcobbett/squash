var Sequelize = require('sequelize');
var sequelize = require('./db.js').sequelize;
var Player = require('./db.js').Player;
var Match = require('./db.js').Match;
var Promise = require('bluebird');

var determineWinner = (match) => {
  return match[2] > match[3] ? match[0] : match[1];
};

var determineLoser = (match) => {
  return match[2] < match[3] ? match[0] : match[1];
};

var getScore = (match) => {

};

var updateRecord = (match) => {
  //
};

var createPlayers = (match) => {
  var players = match.slice(0, 1).map(player => {
    return Player.findOrCreate({'name': player});
  });

  return Promise.all(players).then((player) => {
    console.log(player);
  }).catch(err => {
    console.log(err);
  });
};

var createMatchInstance = (match) => {
  return {
    playerOne: match[0],
    playerTwo: match[1],
    playerOnePoints: match[2],
    playerTwoPoints: match[3],
    winner: determineWinner(match),
    loser: determineLoser(match),
    date: match[4]
  };
};

var insertMatches = (matches) => {
  return Match.bulkCreate(matches);
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

exports.insertMatches = insertMatches;
exports.createMatchInstance = createMatchInstance;
exports.createPlayers = createPlayers;
exports.addOnePlayer = addOnePlayer;
exports.addOneMatch = addOneMatch;