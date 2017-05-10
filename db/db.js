var Sequelize = require('sequelize');
// var models = require('./model.js');

var sequelize = new Sequelize('squash', 'root', '', {
  host: 'localhost',
  dialect: 'mysql',

  pool: {
    max: 5,
    min: 0,
    idle: 10000
  }
});

var Player = sequelize.define('player', {
  name: {
    type: Sequelize.STRING,
    primaryKey: true,
    unique: true
  },
  wins: {
    type: Sequelize.INTEGER,
  },
  losses: {
    type: Sequelize.INTEGER,
  },
  rank: {
    type: Sequelize.INTEGER
  },
  matches: {
    type: Sequelize.INTEGER,
  },
  active: {
    type: Sequelize.BOOLEAN
  },
  skill1: {
    type: Sequelize.REAL
  },
  skill2: {
    type: Sequelize.REAL
  }
});

var Match = sequelize.define('match', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true
  },
  playerOne: {
    type: Sequelize.STRING
  },
  playerTwo: {
    type: Sequelize.STRING
  },
  playerOnePoints: {
    type: Sequelize.STRING,
    allowNull: false
  },
  playerTwoPoints: {
    type: Sequelize.STRING,
    allowNull: false
  },
  winner: {
    type: Sequelize.STRING
  },
  loser: {
    type: Sequelize.STRING
  },
  box: {
    type: Sequelize.STRING
  },
  date: {
    type: Sequelize.STRING
  },
});

sequelize
  .authenticate()
  .then(function(err) {
    console.log('Connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });


sequelize.sync().then(err => {
  console.log('models synced!');
}).catch(err => {
  console.log('unable to sync models', err);
});

exports.Sequelize = Sequelize;
exports.sequelize = sequelize;
exports.Player = Player;
exports.Match = Match;