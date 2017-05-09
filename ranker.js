var Sequelize = require('sequelize');
var sequelize = require('./db/db.js').sequelize;
var Player = require('./db/db.js').Player;
var Match = require('./db/db.js').Match;
var Promise = require('bluebird');
var trueskill = require('trueskill');

var rankPlayers = (req, res) => {

  // select all matches
  Match.findAll({ attributes: ['winner', 'loser']}).then(matches => {
    // for each match
    // update rank for winner and loser based on outcome
    matches.forEach(match => {

      var winnerName = match.dataValues.winner;
      var loserName = match.dataValues.loser;

      var winnerObj;
      var loserObj;
      Player.findOne({
        attributes: ['id', 'name', 'skill1', 'skill2'],
        where: {
          name: winnerName
        }
      })
      .then(winner => {
        winnerObj = winner.dataValues;
        Player.findOne({
          attributes: ['id', 'name', 'skill1', 'skill2'],
          where: {
            name: loserName
          }
        })
        .then(loser => {
          loserObj = loser.dataValues;
          winnerObj.skill = [winnerObj.skill1, winnerObj.skill2];
          loserObj.skill = [loserObj.skill1, loserObj.skill2];

          winnerObj.rank = 1;
          loserObj.rank = 2;

          trueskill.AdjustPlayers([winnerObj, loserObj]);
          console.log('winner skill', winnerObj.skill); // new skill levels for each of these
          console.log('loser skill', loserObj.skill);

          // update winner

          winner.update({
            skill1: winnerObj.skill[0],
            skill2: winnerObj.skill[1]
          })
          .then(() => {
            loser.update({
              skill1: loserObj.skill[0],
              skill2: loserObj.skill[1]
            })
            .then(() => {
              res.send('players ranked!');
              console.log('winner', winner);
              console.log('loser', loser);
            });
          });
        });
      })
      .catch(err => {
        res.send(err);
        console.log(err);
      });

      // the following functions for testing with dummy json
// var addPlayer = (req, res) => {
//   db.addOnePlayer(req.body.name).then(player => {
//     res.send('Muy bueno');
//     console.log(player);
//   }).catch(err => {
//     res.send('No bueno');
//     console.log('Error adding Player', err);
//   });
// };

// var addMatch = (req, res) => {
//   db.addOneMatch(req.body).then(match => {
//     console.log(match);
//     res.send('Match saved');
//   }).catch(err => {
//     res.send(err);
//   });
// };
    }).catch(err => {
      res.send(err);
      console.log(err);
    });
  });
};


// rankPlayers();

module.exports = rankPlayers;