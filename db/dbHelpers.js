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

var createMatchInstance = (match) => {
  return {
    playerOne: match[0],
    playerTwo: match[1],
    playerOnePoints: match[2],
    playerTwoPoints: match[3],
    winner: determineWinner(match),
    loser: determineLoser(match),
    date: match[4],
    id: match[5]
  };
};

var insertMatches = (matchInstances) => {
  return Match.bulkCreate(matchInstances);
};

// var createPlayerInstance = (playerName) => {
//   return {name: playerName};
// };

var findOrCreatePlayer = (playerName) => {
  return Player.findOrCreate({
    where: {name: playerName}
  });
};

var findMatchesByName = (name) => {
  return Match.findAll({
    where: {
      $or: [
        {
          playerOne: {
            $eq: name
          }
        },
        {
          playerTwo: {
            $eq: name
          }
        }
      ]
    }
  });
};


// for testing with dummy json data
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

// exports.createPlayerInstance = createPlayerInstance;
exports.findMatchesByName = findMatchesByName;
exports.findOrCreatePlayer = findOrCreatePlayer;
exports.insertMatches = insertMatches;
exports.createMatchInstance = createMatchInstance;
// exports.createPlayers = createPlayers;
exports.addOnePlayer = addOnePlayer;
exports.addOneMatch = addOneMatch;



// var getScore = (match) => {

// };

// var updateRecord = (match) => {
//   //
// };

// var createPlayers = (match) => {
//   var players = match.slice(0, 1).map(player => {
//     return Player.findOrCreate({'name': player});
//   });

//   return Promise.all(players).then((player) => {
//     console.log(player);
//   }).catch(err => {
//     console.log(err);
//   });
// };