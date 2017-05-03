var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var fs = require('fs');
var db = require('./db/dbHelpers.js');
// require('console.table');
// var matchData = require('./matches.json').matches;

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

var joinMatchData = (matchUps, scores, month) => {
  return scores.map((score, i) => {
    return matchUps[i].concat(score, month);
  });
};


var scrape = (req, res) => {

  var baseURL = 'http://www.calsquash.com/boxleague';
  var currentMonth = '/s4.php?file=current.players';

  // var URLStack = ['/jul03.html', '/aug03.html', '/sep03.html', '/oct03.html', '/nov03.html', '/feb04.html', '/mar04.html', '/apr04.html', '/may04.html', '/jun04.html', '/jul04.html', '/oct04.html', '/nov04.html', '/jan05.html', '/feb05.html', '/mar06.html', '/apr06.html', '/jul09.html', '/sep09.html', '/nov09.html', '/jul09.html', currentMonth];
  var URLStack = ['/feb04.html', '/mar04.html'];  // smaller batch for testing

  var fetchURLs = (url, cb) => {

    request(url, (err, success, body) => { // TODO: error handling
      var $ = cheerio.load(body);

      // parse match data
      cheerioTableparser($);
      var month = url.slice(url.lastIndexOf('/') + 1, -5);
      var tables = [];
      $('table').each(function() {
        tables.push(($(this).parsetable(false, false, true)).slice(1, -2));
      });
      var matches = []; // concat all matches into one array for the month
      tables.forEach(table => {
        matches = matches.concat(joinMatchData(parseMatchOpponents(table), parseMatchScores(table), month));
      });
      // console.log('matches: ', matches);

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

      if (currentURL === '/feb04.html') {
        console.log('Done scraping');
        cb.send(matches);  // send back match data
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


var generatePlayersList = function(matches) {
  var players = [];
  matches.forEach(match => {
    players.push(match[0]);
    players.push(match[1]);
  });

  var uniques = players.filter((val, i, array) => {
    return array.indexOf(val) === i;
  });

  fs.writeFile('players.json', uniques, (err) => {
    if (err) {
      throw err;
    }
    console.log('Players saved!');
  });
  // return uniques;
};
// generatePlayersList(matchData);

var searchForMatchesByName = (matches, name) => {
  return matches.filter(match => {
    return match[0] === name || match[1] === name;
  });
};

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
exports.scrape = scrape;
exports.addPlayer = addPlayer;
exports.addMatch = addMatch;

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
