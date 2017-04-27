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

var fetchMatchData = () => {

  request('http://www.calsquash.com/boxleague/s4.php?file=current.players', (err, success, body) => {
    var $ = cheerio.load(body)
    cheerioTableparser($);
    var data = $('table').first().parsetable(false, false, true).slice(1, -2);
    // console.log(data)
    var data1 = data.slice(1).map(row => row.slice(1))
    // data.slice(1).forEach(row => data1.unshift(row[0]))
    data1.pop();
    // console.log(data1);



    var matches = [
      [ 0, 1, 2, 3, 4, 5 ],
      [ 1, 0, 1, 2, 3, 4 ],
      [ 2, 1, 0, 1, 2, 3 ],
      [ 3, 2, 1, 0, 1, 2 ],
      [ 4, 3, 2, 1, 0, 1 ],
      [ 5, 4, 3, 2, 1, 0 ]
    ]

    var output = [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [5, 5],
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
      [1, 1],
      [2, 2],
      [3, 3],
      [1, 1],
      [2, 2],
      [1, 1]
    ]

    var matchScores = [];

    for (var i = 0; i < matches.length - 1; i++) {
      matches[i].shift();
      for (var k = 0; k < matches[i].length; k++) {
        matchScores.push([matches[i + 1 + k].shift(), matches[i][k]])
      }
    }
      // console.log(matches)
      console.log(matchScores)
    console.log(JSON.stringify(matchScores) === JSON.stringify(output));



  })
}

fetchMatchData()

// var output = [
//   [ '1', '1' ],
//   [ '1', '1' ],
//   [ '1', '1' ],
//   [ '1', '1' ],
//   [ '1', '1' ],
//   [ '2', '2' ],
//   [ '2', '2' ],
//   [ '2', '2' ],
//   [ '2', '2' ],
//   [ '3', '3' ],
//   [ '3', '3' ],
//   [ '3', '3' ],
//   [ '4', '4' ],
//   [ '4', '4' ],
//   [ '5', '5' ]
// ]

    // for (var i = 0; i < matches.length; i++) {
    //   for (var k = 1; k < matches[i].length; k++) {
    //     matchScores.push([matches[i][k], matches[k].shift()])
    //   }
    // }
    // console.log(matchScores)

// var matches = [
//   [ 'X', '2', '1', '2', '3', '1' ],
//   [ '5', 'X', '4', '1', '1', '1' ],
//   [ '6', '3', 'X', '0', '', '' ],
//   [ '5', '6', '5', 'X', '5', '5' ],
//   [ '4', '6', '', '0', 'X', '' ],
//   [ '6', '6', '', '0', '', 'X' ]
//   ]

    // var matches = [
    //   [ 'X', '1', '1', '1', '1', '1' ],
    //   [ '1', 'X', '2', '2', '2', '2' ],
    //   [ '1', '2', 'X', '3', '3', '3' ],
    //   [ '1', '2', '3', 'X', '4', '4' ],
    //   [ '1', '2', '3', '4', 'X', '5' ],
    //   [ '1', '2', '3', '4', '5', 'X' ]
    // ]


        // var matches = [
    //   [ 'X', 1, 1, 1, 1, 1 ],
    //   [ 1, 'X', 2, 2, 2, 2 ],
    //   [ 1, 2, 'X', 3, 3, 3 ],
    //   [ 1, 2, 3, 'X', 4, 4 ],
    //   [ 1, 2, 3, 4, 'X', 5 ],
    //   [ 1, 2, 3, 4, 5, 'X' ]
    // ]