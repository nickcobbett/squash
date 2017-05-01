/*not installed
var express = require('express');
var app     = express();
var bodyParser = require('body-parser');
*/
var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var fs = require('fs');
// require('console.table');
var matchData = require('./matches.json').matches;

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

var joinOpponentsAndScores = (matchUps, scores, month) => {
  return scores.map((score, i) => {
    return matchUps[i].concat(score, month);
  });
};

var baseUrl = 'http://www.calsquash.com/boxleague';
var currentUrl = '/s4.php?file=current.players';

var testURL = '/dec09.html';

var fetchMatchData = (url) => {

  request(url, (err, success, body) => {
    var $ = cheerio.load(body);

    var nextUrl = $('ul li a').attr('href').slice(1);
    console.log('nextUrl', nextUrl);

    var title = $('h1').text();
    var month = title.slice(title.indexOf('-') + 2);
    console.log('month: ', month);

    cheerioTableparser($);

    var tables = [];
    $('table').each(function() {
      tables.push(($(this).parsetable(false, false, true)).slice(1, -2));
    });
    var matches = []; // concat all matches into one array for the month
    tables.forEach(table => {
      matches = matches.concat(joinOpponentsAndScores(parseMatchOpponents(table), parseMatchScores(table), month));
    });
    // console.log('matches: ', matches);

    //convert file to javasript object
    fs.readFile('./matches.json', 'utf-8', ((err, data) => {
      if (err) {
        throw err;
      }
      var arrayOfObjects = JSON.parse(data);
      arrayOfObjects.matches = arrayOfObjects.matches.concat(matches);

      fs.writeFile('./matches.json', JSON.stringify(arrayOfObjects), (err) => {
        if (err) {
          throw err;
        }
        console.log('The file has been saved!');
      });
    }));

    if (nextUrl !== currentUrl) {
      currentUrl = nextUrl;
      fetchMatchData(baseUrl + nextUrl);
    } else {
      console.log('All match data received!');
      return;
    }

  });
};

fetchMatchData(baseUrl + testURL);


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
// var nicks = searchForMatchesByName(matchData, 'Nick Cobbett');
// var nickAndSam = searchForMatchesByName(nicks, 'Sam Sternberg');
// console.log(nickAndSam);
