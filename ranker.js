var Sequelize = require('sequelize');
var sequelize = require('./db/db.js').sequelize;
var Player = require('./db/db.js').Player;
var Match = require('./db/db.js').Match;
var Promise = require('bluebird');
var trueskill = require('trueskill');

var rankPlayers = () => {

  // select all matches
  Match.findAll({ attributes: ['winner', 'loser']}).then(matches => {
    // for each match
    // update rank for winner and loser based on outcome
    // matches.forEach(match => {

    // })

    var winnerName = matches[0].dataValues.winner;
    var loserName = matches[0].dataValues.loser;

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
          console.log('winner', winner);
          console.log('loser', loser);
        });
        });
      });
    })
    .catch(err => {
      console.log(err);
    });


    // var winner = {}
    // var loser = {}

    // winner.skill = {get prev skill of winner}
    // loser.skill = {get prev skill of loser}

    // winner.rank = 1;
    // loser.rank = 2;

    // trueskill.AdjustPlayers([winner, loser]);



    // matches.forEach(match => {

    //   Player.find({ where: })
    // })

  }).catch(err => {
    console.log(err);
  });
};
rankPlayers();

// alice = {}
// alice.skill = [25.0, 25.0/3.0]

// bob = {}
// bob.skill = [25.0, 25.0/3.0]

// chris = {}
// chris.skill = [25.0, 25.0/3.0]

// darren = {}
// darren.skill = [25.0, 25.0/3.0]

// // The four players play a game.  Alice wins, Bob and Chris tie for
// // second, Darren comes in last.  The actual numerical values of the
// // ranks don't matter, they could be (1, 2, 2, 4) or (1, 2, 2, 3) or
// // (23, 45, 45, 67).  All that matters is that a smaller rank beats a
// // larger one, and equal ranks indicate draws.

// alice.rank = 1
// bob.rank = 2
// chris.rank = 2
// darren.rank = 4

// // Do the computation to find each player's new skill estimate.

// // trueskill = require("trueskill");
// trueskill.AdjustPlayers([alice, bob, chris, darren]);

// // Print the results.

// console.log("alice:");
// console.log(alice.skill);
// console.log("bob:");
// console.log(bob.skill);
// console.log("chris:");
// console.log(chris.skill);
// console.log("darren:");
// console.log(darren.skill);

// exports.rankPlayers = rankPlayers;

// // Project.find({ where: { title: 'aProject' } })
// //   .on('success', function (project) {
// //     // Check if record exists in db
// //     if (project) {
// //       project.updateAttributes({
// //         title: 'a very different title now'
// //       })
// //       .success(function () {});
// //     }
// //   });