/*not installed
var express = require('express');
var app     = express();
var bodyParser = require('body-parser');
*/
var request = require('request');
var cheerio = require('cheerio');
var cheerioTableparser = require('cheerio-tableparser');
var fs = require('fs');
require('console.table');


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

var joinOpponentsAndScores = (matchUps, scores) => {
  return scores.map((score, i) => {
    return matchUps[i].concat(score);
  });
};

var fetchMatchData = () => {

  request('http://www.calsquash.com/boxleague/s4.php?file=current.players', (err, success, body) => {
    var $ = cheerio.load(body);
    cheerioTableparser($);

    var tables = [];
    $('table').each(function() {
      tables.push(($(this).parsetable(false, false, true)).slice(1, -2));
    });
    var matches = []; // concat all matches into one array for the month
    tables.forEach(table => {
      matches = matches.concat(joinOpponentsAndScores(parseMatchOpponents(table), parseMatchScores(table)));
    });
    console.log('matches: ', matches);

    //convert file to javasript object
    fs.readFile('./matches.json', 'utf-8', ((err, data) => {
      if (err) {
        throw err;
      }
      var arrayOfObjects = JSON.parse(data);
      arrayOfObjects.matches = matches;

      fs.writeFile('./matches.json', JSON.stringify(arrayOfObjects), (err) => {
        if (err) {
          throw err;
        }
        console.log('The file has been saved!');
      });
    }));

  });
};

fetchMatchData();