var Sequelize = require('sequelize');
var sequelize = require('./db/db.js').sequelize;
var Player = require('./db/db.js').Player;
var Match = require('./db/db.js').Match;
var Promise = require('bluebird');
var trueskill = require('trueskill');

var adjustSkills = (winner, loser) => { //player1 = {id: 123, name: nick, skill1: 25, skill2: 8}
  var winnerObj = {};
  var loserObj = {};
  winnerObj.skill = [winner.skill1, winner.skill2];
  loserObj.skill = [loser.skill1, loser.skill2];

  winnerObj.rank = 1;
  loserObj.rank = 2;

  trueskill.AdjustPlayers([winnerObj, loserObj]);
  winner.skill1 = winnerObj.skill[0];
  winner.skill2 = winnerObj.skill[1];
  loser.skill1 = loserObj.skill[0];
  loser.skill2 = loserObj.skill[1];
};

var updateSkillsInDB = (req, res) => {

  Match.findAll({ attributes: ['winner', 'loser']})
  .each(match => {
    var winnerName = match.dataValues.winner;
    var loserName = match.dataValues.loser;

    //find winner and loser
    return (Promise.all([Player.findById(winnerName, { attributes: ['name', 'wins', 'losses', 'matches', 'skill1', 'skill2']}), Player.findById(loserName, { attributes: ['name', 'wins', 'losses', 'matches', 'skill1', 'skill2']})])
    .then(results => {
      //adjust skills
      var winner = results[0];
      var loser = results[1];
      adjustSkills(winner, loser);
      console.log('winner skill1', winner.skill1); // new skill levels for each of these
      console.log('loser skill1', loser.skill1);
      return [winner, loser];
    })
    .then(results => {
      // update new skill values for winner and loser
      return Promise.all([results[0].update({wins: results[0].dataValues.wins + 1, matches: results[0].dataValues.matches + 1, skill1: results[0].dataValues.skill1, skill2: results[0].dataValues.skill2}), results[1].update({losses: results[1].dataValues.losses + 1, matches: results[1].dataValues.matches + 1, skill1: results[1].dataValues.skill1, skill2: results[1].dataValues.skill2})]);
    }))
    .then(success => {
      console.log('One match updated');
    })
    .catch(err => {
      console.log('One match rejected', err);
    });
  })
  .then(success => {
    console.log('Everyone is skilled!');
    res.send(success);
  })
  .catch(err => {
    res.send('Boo Nick!');
  });
};


module.exports = updateSkillsInDB;



// var rankPlayers = (req, res) => {

//   // select all matches
//   Match.findAll({ attributes: ['winner', 'loser']})
//     .each(match => {
//       var winnerName = match.dataValues.winner;
//       var loserName = match.dataValues.loser;

//       var winnerObj;
//       var loserObj;

//       // retrieve winner
//       Player.findOne({
//         attributes: ['id', 'name', 'skill1', 'skill2'],
//         where: {
//           name: winnerName
//         }
//       })
//       // retreive loser
//       .then(winner => {
//         winnerObj = winner.dataValues;
//         Player.findOne({
//           attributes: ['id', 'name', 'skill1', 'skill2'],
//           where: {
//             name: loserName
//           }
//         })
//         //
//         .then(loser => {
//           loserObj = loser.dataValues;
//           winnerObj.skill = [winnerObj.skill1, winnerObj.skill2];
//           loserObj.skill = [loserObj.skill1, loserObj.skill2];

//           //adjust ranks

//           winnerObj.rank = 1;
//           loserObj.rank = 2;

//           trueskill.AdjustPlayers([winnerObj, loserObj]);
//           console.log('winner skill', winnerObj.skill); // new skill levels for each of these
//           console.log('loser skill', loserObj.skill);

//           // update winner

//           winner.update({
//             skill1: winnerObj.skill[0],
//             skill2: winnerObj.skill[1]
//           })
//           .then(() => {
//             loser.update({
//               skill1: loserObj.skill[0],
//               skill2: loserObj.skill[1]
//             })
//             .then(() => {
//               console.log('###');
//               // res.send('players ranked!');
//             });
//           });
//         });
//       })
//       .then(() => {
//         console.log('$$');
//       })
//       .catch(err => {
//         res.send(err);
//       });
//     })
// };



// var adjustSkills = (winner, loser) => { //player1 = {id: 123, name: nick, skill1: 25, skill2: 8}
//   var winnerObj = {};
//   var loserObj = {};
//   winnerObj.skill = [winner.skill1, winner.skill2];
//   loserObj.skill = [loser.skill1, loser.skill2];

//   winnerObj.rank = 1;
//   loserObj.rank = 2;

//   trueskill.AdjustPlayers([winnerObj, loserObj]);
//   winner.skill1 = winnerObj.skill[0];
//   winner.skill2 = winnerObj.skill[1];
//   loser.skill1 = loserObj.skill[0];
//   loser.skill2 = loserObj.skill[1];
// };

// var updateSkillsInDB = (req, res) => {

//   Match.findAll({ attributes: ['winner', 'loser']})
//   .each(match => {
//     var winnerName = match.dataValues.winner;
//     var loserName = match.dataValues.loser;

//     //find winner and loser
//     return (Promise.all([Player.findById(winnerName, { attributes: ['name', 'skill1', 'skill2']}), Player.findById(loserName, { attributes: ['name', 'skill1', 'skill2']})])
//     .then(results => {
//       //adjust skills
//       var winner = results[0];
//       var loser = results[1];
//       adjustSkills(winner.dataValues, loser.dataValues);
//       console.log('winner skill1', winner.dataValues.skill1); // new skill levels for each of these
//       console.log('loser skill1', loser.dataValues.skill1);
//       return [winner, loser];
//     })
//     .then(results => {
//       // update new skill values for winner and loser
//       return Promise.all([results[0].update({skill1: results[0].dataValues.skill1, skill2: results[0].dataValues.skill2}), results[1].update({skill1: results[1].dataValues.skill1, skill2: results[1].dataValues.skill2})]);
//     }))
//     .then(success => {
//       console.log('One match updated');
//     })
//     .catch(err => {
//       console.log('One match rejected', err);
//     });
//   })
//   .then(success => {
//     console.log('Everyone is skilled!');
//     res.send(success);
//   })
//   .catch(err => {
//     res.send('Boo Nick!');
//   });
// };