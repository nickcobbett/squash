var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var fs = require('fs');
var db = require('./db/dbHelpers.js');
var Promise = require('bluebird');

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

var joinMatchData = (players, scores, month) => {
  return scores.map((score, i) => {
    return players[i].concat(score, month, generateId(players[i], month));
  });
};

var scrape = (req, res) => {

  var baseURL = 'http://www.calsquash.com/boxleague';
  var currentMonth = '/s4.php?file=current.players';
  var oldestMonth = '/feb04.html';

  if (req.body.recent) { // only
    oldestMonth = '/feb17.html';
  }


  var URLStack = ['/feb04.html', '/mar04.html', '/apr04.html', '/may04.html', '/jun04.html', '/jul04.html', '/oct04.html', '/nov04.html', '/jan05.html', '/feb05.html', '/mar06.html', '/apr06.html', '/jul09.html', '/sep09.html', '/nov09.html', '/jul09.html', currentMonth];
  // var URLStack = ['/feb04.html', '/mar04.html'];  // smaller batch for testing

  var fetchURLs = (url, cb) => {

    request(url, (err, success, body) => { // TODO: error handling
      var $ = cheerio.load(body);

      // gather this month's match data
      cheerioTableparser($);
      // var month = url.slice(url.lastIndexOf('/') + 1, -5);
      var month = $('h1').text().slice(24).replace(/ /g, '');
      var tables = [];
      $('table').each(function() {
        tables.push(($(this).parsetable(false, false, true)).slice(1, -2));
      });
      var matches = []; // concat all matches into one array for the month
      tables.forEach(table => {
        matches = matches.concat(joinMatchData(parseMatchOpponents(table), parseMatchScores(table), month));
      });
      // console.log('matches: ', matches);

      // prepare player data to send to db
      var players = matches.map(match => {
        return match[0];
      }).concat(matches.map(match => {
        return match[1];
      })).filter((val, i, arr) => {
        return arr.indexOf(val) === i;
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
      // filter empty matches
      var completedMatches = matches.filter(match => {
        return match[2] !== '' && match[3] !== '';
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



// the following functions for testing with dummy json
var addPlayer = (req, res) => {
  db.addOnePlayer(req.body.name).then(player => {
    res.send('Muy bueno');
    console.log(player);
  }).catch(err => {
    res.send('No bueno');
    console.log('Error adding Player', err);
  });
};

var addMatch = (req, res) => {
  db.addOneMatch(req.body).then(match => {
    console.log(match);
    res.send('Match saved');
  }).catch(err => {
    res.send(err);
  });
};

exports.getHeadToHead = getHeadToHead;
exports.getMatchesByName = getMatchesByName;
exports.scrape = scrape;
exports.addPlayer = addPlayer;
exports.addMatch = addMatch;


  // var olderMonths = ['/jul03.html', '/aug03.html', '/sep03.html', '/oct03.html', '/nov03.html'];



// var generatePlayersList = function(matches) {
//   var players = [];
//   matches.forEach(match => {
//     players.push(match[0]);
//     players.push(match[1]);
//   });

//   var uniques = players.filter((val, i, array) => {
//     return array.indexOf(val) === i;
//   });

//   fs.writeFile('players.json', uniques, (err) => {
//     if (err) {
//       throw err;
//     }
//     console.log('Players saved!');
//   });
//   // return uniques;
// };
// // generatePlayersList(matchData);

// var searchForMatchesByName = (matches, name) => {
//   return matches.filter(match => {
//     return match[0] === name || match[1] === name;
//   });
// };
// var nicks = searchForMatchesByName(matchData, 'Nick Cobbett');
// var nickAndSam = searchForMatchesByName(nicks, 'Sam Sternberg');
// console.log(nickAndSam);




    // //convert file to javasript object
    // fs.readFile('./matches.json', 'utf-8', ((err, data) => {
    //   if (err) {
    //     throw err;
    //   }
    //   var arrayOfObjects = JSON.parse(data);
    //   arrayOfObjects.matches = arrayOfObjects.matches.concat(matches);

    //   fs.writeFile('./matches.json', JSON.stringify(arrayOfObjects), (err) => {
    //     if (err) {
    //       throw err;
    //     }
    //     console.log('The file has been saved!');
    //   });
    // }));
