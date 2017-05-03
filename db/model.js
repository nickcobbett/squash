var Sequelize = require('sequelize');
var sequelize = require('./db.js');

var Player = sequelize.define('player', {
  name: {
    type: Sequelize.STRING,
    unique: true
  },
  wins: {
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  losses: {
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  rank: {
    type: Sequelize.INTEGER
  },
  matches: {
    type: Sequelize.INTEGER,
    autoIncrement: true
  },
  active: {
    type: Sequelize.BOOLEAN
  },
});

var Match = sequelize.define('match', {
  playerOne: {
    type: Sequelize.STRING
  },
  playerTwo: {
    type: Sequelize.STRING
  },
  playerOnePoints: {
    type: Sequelize.INTEGER
  },
  playerTwoPoints: {
    type: Sequelize.INTEGER
  },
  winner: {
    type: Sequelize.STRING
  },
  loser: {
    type: Sequelize.STRING
  },
  score: {
    type: Sequelize.INTEGER
  },
  date: {
    type: Sequelize.STRING
  },
});

module.exports.Player = Player;
module.exports.Match = Match;


  // winner: {
  //   type: Sequelize.STRING,
  //   get: function() {
  //     return this.getDataValue('playerOnePoints') > this.getDataValue('playerTwoPoints') ? this.getDataValue('playerOne') : this.getDataValue('playerTwo');
  //   }
  // },
  // loser: {
  //   type: Sequelize.STRING,
  //   get: function() {
  //     return this.getDataValue('playerOnePoints') < this.getDataValue('playerTwoPoints') ? this.getDataValue('playerOne') : this.getDataValue('playerTwo');
  //   }
  // },