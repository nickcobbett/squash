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
    id: match[5],
    box: match[6]
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
    where: {name: playerName},
    defaults: {skill1: 25, skill2: 25 / 3.0}
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
// select * from matches where playerOne="Nick Cobbett" and playerTwo="sam sternberg" OR (playerOne="sam sternberg" and playerTwo="nick cobbett");
var findHeadToHead = (name1, name2) => {
  return sequelize.query('SELECT * FROM matches WHERE playerOne=? AND playerTwo=? OR (playerOne=? and playerTwo=?)', { replacements: [name1, name2, name2, name1], type: sequelize.QueryTypes.SELECT});
};

var getMatchesAll = () => {
  return Match.findAll();
};

var getPlayersAll = () => {
  return Player.findAll();
};

var addPlayers = () => {
  var names = [];
  return Match.findAll({ attributes: ['playerOne']})
    .then(players => {
      names = players.map(player => {
        return player.dataValues.playerOne;
      });
      Match.findAll({ attributes: ['playerTwo']}).then(players => {
        names = names.concat(players.map(player => {
          return player.dataValues.playerTwo;
        }));

        names = names.filter((val, i, array) => {
          return array.indexOf(val) === i;
        });

        var namesPromises = [];
        names.forEach(name => {
          namesPromises.push(findOrCreatePlayer(name));
        });
        Promise.all(namesPromises)
        .then(success => {
          console.log('players added', success);
        }).catch(err => {
          console.log('err', err);
        });



      });
    });
};



// exports.createPlayerInstance = createPlayerInstance;
exports.addPlayers = addPlayers;
exports.getMatchesAll = getMatchesAll;
exports.findHeadToHead = findHeadToHead;
exports.findMatchesByName = findMatchesByName;
exports.findOrCreatePlayer = findOrCreatePlayer;
exports.insertMatches = insertMatches;
exports.createMatchInstance = createMatchInstance;
exports.getPlayersAll = getPlayersAll;