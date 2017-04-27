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

var matches = [
  ['0', 'a', 'b', 'c', 'd', 'e', 'f'],
  ['a', '0', '1', '2', '3', '4', '5' ],
  ['b', '1', '0', '1', '2', '3', '4' ],
  ['c', '2', '1', '0', '1', '2', '3' ],
  ['d', '3', '2', '1', '0', '1', '2' ],
  ['e', '4', '3', '2', '1', '0', '1' ],
  ['f', '5', '4', '3', '2', '1', '0' ]
]

// var data = [ [ 'X', '2', '1', '2', '3', '1' ],
//   [ '5', 'X', '4', '1', '1', '1' ],
//   [ '6', '3', 'X', '0', '', '' ],
//   [ '5', '6', '5', 'X', '5', '5' ],
//   [ '4', '6', '', '0', 'X', '' ],
//   [ '6', '6', '', '0', '', 'X' ] ]

var fullTable = [ [ '',
    'Colin Grant',
    'Eric Katerman',
    'Sam Sternberg',
    'Ashley Kayler',
    'Shrinu Kushagra',
    'Sam McCormick' ],
  [ 'CG', 'X', '2', '1', '2', '3', '1' ],
  [ 'EK', '5', 'X', '4', '1', '1', '1' ],
  [ 'SS', '6', '3', 'X', '0', '', '' ],
  [ 'AK', '5', '6', '5', 'X', '5', '5' ],
  [ 'SK', '4', '6', '', '0', 'X', '' ],
  [ 'SM', '6', '6', '', '0', '', 'X' ],
  [ 'Total', '26', '23', '10', '3', '9', '7' ] ]

var opponentOutput = [
  ['a', 'b'],
  ['a', 'c'],
  ['a', 'd'],
  ['a', 'e'],
  ['a', 'f'],
  ['b', 'c'],
  ['b', 'd'],
  ['b', 'e'],
  ['b', 'f'],
  ['c', 'd'],
  ['c', 'e'],
  ['c', 'f'],
  ['d', 'e'],
  ['d', 'f'],
  ['e', 'f']
]



var parseMatchScores = (array) => {
  var arr = JSON.parse(JSON.stringify(array));
  var matchScores = [];

  // get just the scores from the table
  var justTheScores = arr.slice(1).map(row => row.slice(1))
  // console.log('justTheScores', justTheScores);
  justTheScores.pop();
  for (var i = 0; i < justTheScores.length - 1; i++) {
    justTheScores[i].shift();
    for (var k = 0; k < justTheScores[i].length; k++) {
      matchScores.push([justTheScores[i + 1 + k].shift(), justTheScores[i][k]])
    }
  }

  return matchScores;
}

var parseMatchOpponents = (array) => {
  array = JSON.parse(JSON.stringify(array));
  var matchUps = [];
  var row = array[0];
  row.shift()
  // console.log(row)
  for (var i = 0; i < row.length; i++) {
    for (var k = i + 1; k < row.length; k++) {
      matchUps.push([row[i], row[k]]);
    }
  }

  return matchUps;
}

var joinOpponentsAndScores = (matchUps, scores) => {
  return scores.map((score, i) => {
    return matchUps[i].concat(score)
  })
}



// console.log('matches: ', fullTable)
// var scores = parseMatchScores(fullTable)
// console.log('scores: ', scores);
// var matchUps = parseMatchOpponents(fullTable)
// console.log('matchUps: ', matchUps);
// console.log(JSON.stringify(parseMatchOpponents(fullTable)) === JSON.stringify(opponentOutput));
// var games = scores.map((score, i) => {
//   return matchUps[i].concat(score)
// })
// console.log('games', games);




var fetchMatchData = () => {

  request('http://www.calsquash.com/boxleague/s4.php?file=current.players', (err, success, body) => {
    var $ = cheerio.load(body)
    cheerioTableparser($);
    var table = $('table').first().parsetable(false, false, true).slice(1, -2);
    console.log('table', table)
    // var justTheScores = table.slice(1).map(row => row.slice(1))
    // data.slice(1).forEach(row => data1.unshift(row[0]))
    // justTheScores.pop();
    // console.log('justTheScores', justTheScores);
    var matches = joinOpponentsAndScores(parseMatchOpponents(table), parseMatchScores(table));
    console.log('matches: ', matches)


  })
}

fetchMatchData()

// var opponentOutput = [
//   ['a', 'b'],
//   ['a', 'c'],
//   ['a', 'd'],
//   ['a', 'e'],
//   ['a', 'f'],
//   ['b', 'c'],
//   ['b', 'd'],
//   ['b', 'e'],
//   ['b', 'f'],
//   ['c', 'd'],
//   ['c', 'e'],
//   ['c', 'f'],
//   ['d', 'e'],
//   ['d', 'f'],
//   ['e', 'f']
// ]
