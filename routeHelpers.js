var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var fs = require('fs');
var db = require('./db/dbHelpers.js');
var Promise = require('bluebird');

// generate unique ID for each match to prevent dubplicate entries
String.prototype.hashCode = function() {
  var hash = 0;
  var i;
  var chr;
  if (this.length === 0) {
    return hash;
  }
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};


var parseMatchScores = (array) => {
  var arr = JSON.parse(JSON.stringify(array));
  var matchScores = [];

  // get just the scores from the table
  var justTheScores = arr.slice(1).map(row => row.slice(1));
  justTheScores.pop();
  for (var i = 0; i < justTheScores.length - 1; i++) {
    justTheScores[i].shift();
    for (var k = 0; k < justTheScores[i].length; k++) {
      matchScores.push([justTheScores[i + 1 + k].shift(), justTheScores[i][k]]);
    }
  }
  return matchScores;
};

var parseMatchOpponents = (array) => {
  array = JSON.parse(JSON.stringify(array));

  var matchUps = [];
  var row = array[0];
  row.shift();
  for (var i = 0; i < row.length; i++) {
    for (var k = i + 1; k < row.length; k++) {
      matchUps.push([row[i], row[k]]);
    }
  }

  return matchUps;
};

var generateId = (players, month) => {
  return (players[0] + players[1] + month).hashCode();
};

var joinMatchData = (players, scores, month, box) => {
  return scores.map((score, i) => {
    return players[i].concat(score, month, generateId(players[i], month), box);
  });
};

var scrape = (req, res) => {

  var baseURL = 'http://www.calsquash.com/boxleague';
  var currentMonth = '/s4.php?file=current.players';
  var oldestMonth = '/mar17.html';

  if (JSON.parse(req.body.scrapeAll)) { // only scrape all data if this flag is true, otherwise scrape last few months
    oldestMonth = '/feb04.html';
  }


  var URLStack = ['/feb04.html', '/mar04.html', '/apr04.html', '/may04.html', '/jun04.html', '/jul04.html', '/oct04.html', '/nov04.html', '/jan05.html', '/feb05.html', '/mar06.html', '/apr06.html', '/jul09.html', '/sep09.html', '/nov09.html', '/jul09.html', currentMonth];

  var months = []; // for testing

  var fetchURLs = (url, cb) => {

    request(url, (err, success, body) => { // TODO: error handling
      var $ = cheerio.load(body);

      // gather this month's match data
      cheerioTableparser($);
      // var month = url.slice(url.lastIndexOf('/') + 1, -5);
      var month = $('h1').text().slice(24).replace(/ /g, '');
      months.push(month);
      var tables = [];
      var box = '';
      $('table').each(function() {
        box = ($(this).parsetable(false, false, true)).shift()[0];
        tables.push(($(this).parsetable(false, false, true)).slice(1, -2));
      });
      // console.log('####', tables);
      var matches = []; // concat all matches into one array for the month
      tables.forEach(table => {
        matches = matches.concat(joinMatchData(parseMatchOpponents(table), parseMatchScores(table), month, box));
      });
      // console.log('matches: ', matches);

      // prepare player data to send to db
      var players = matches.map(match => {
        return match[0];
      }).concat(matches.map(match => {
        return match[1];
      })).filter((val, i, arr) => {
        return arr.indexOf(val) === i;
      }).filter(match => {
        return (match[2] !== '' && match[3] !== '') && ((match[2] !== '0' && match[3] !== '5') || (match[2] !== '5' && match[3] !== '0'));
      });



      var playerPromises = [];
      players.forEach(name => {
        playerPromises.push(db.findOrCreatePlayer(name));
      });

      Promise.all(playerPromises).then(player => {
        console.log('player inserted into db!');
      }).catch(err => {
        console.log('error inserting player into db: ', err);
      });


      // prepare match data to send to db
      // filter empty matches and walkovers
      var completedMatches = matches.filter(match => {
        return (match[2] !== '' && match[3] !== '') && ((match[2] !== '0' && match[3] !== '5') || (match[2] !== '5' && match[3] !== '0'));
      });
      // prepare matches for bulk insert
      var matchInstances = completedMatches.map(match => {
        return db.createMatchInstance(match);
      });
      // send to db
      db.insertMatches(matchInstances).then(matches => {
        console.log('match inserted!');
      }).catch(err => {
        console.log('error inserting matchInstances', err);
      });


      // find previous month's data
      var currentURL = url.slice(baseURL.length);
      var nextURL;
      if ($('ul li a').attr('href')) {
        nextURL = $('ul li a').attr('href').slice(1);
      } else {
        nextURL = URLStack.pop();
      }
      console.log('nextURL', nextURL);
      console.log('currentURL: ', currentURL);

      if (currentURL === oldestMonth) {
        console.log('Done scraping');
        cb.send(month);  // send back match data
        return;
      } else if (nextURL !== currentURL) {
        URLStack.push(nextURL);
        fetchURLs(baseURL + URLStack.pop(), cb);
      } else if (URLStack.length) {
        console.log('poppedURL', URLStack[URLStack.length - 1]);
        fetchURLs(baseURL + URLStack.pop(), cb);
      }
    });
  };
  fetchURLs(baseURL + URLStack.pop(), res);
};

var getMatchesByName = (req, res) => {
  console.log(req.params.name);
  db.findMatchesByName(req.params.name).then(matches => {
    res.send(matches);
  }).catch(err => {
    res.send('no bueno', err);
  });
};

var getHeadToHead = (req, res) => {
  var players = req.params.playerOne + ' ' + req.params.playerTwo;
  db.findHeadToHead(req.params.playerOne, req.params.playerTwo).then(matches => {
    res.send(matches);
  }).catch(err => {
    res.send(err);
  });
};


var addAllPlayers = (req, res) => {
  db.addPlayers().then(players => {
    res.send(players);
  }).catch(err => {
    res.send(err);
  });
};


var getMatchesAll = (req, res) => {
  db.getMatchesAll().then(success => {
    res.send(success);
  }).catch(err => {
    res.send(err);
  });
};

var getPlayersAll = (req, res) => {
  db.getPlayersAll().then(success => {
    res.send(success);
  }).catch(err => {
    res.send(err);
  });
};

var getPlayersByName = (req, res) => {
  console.log(req.params.name);
  db.findOrCreatePlayer(req.params.name).then(player => {
    res.send(player);
  }).catch(err => {
    res.send(err);
  });
};

var getPlayersByRank = (req, res) => {
  db.getPlayersByRank().then(results => {
    fs.writeFile('rank.md', results, (err, success) => {
      res.send(results);
    });
  }).catch(err => {
    res.send(err);
  });
};

exports.getPlayersByRank = getPlayersByRank;
exports.scrape = scrape;
exports.addAllPlayers = addAllPlayers;
exports.getMatchesByName = getMatchesByName;
exports.getMatchesAll = getMatchesAll;
exports.getHeadToHead = getHeadToHead;
exports.getPlayersAll = getPlayersAll;
exports.getPlayersByName = getPlayersByName;
// exports.addPlayer = addPlayer;
// exports.addMatch = addMatch;


