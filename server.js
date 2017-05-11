var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = require('./routeHelpers.js');
var rankPlayers = require('./ranker.js');

app.use(bodyParser.json());

// app.get('/', router.getMatchesAll);
app.get('/matches', router.getMatchesAll);
app.get('/matches/:name', router.getMatchesByName);
app.get('/matches/headtohead/:playerOne/:playerTwo', router.getHeadToHead);
app.get('/players', router.getPlayersAll);
app.get('/players/:name', router.getPlayersByName);
app.get('/rankings', router.getPlayersByRank);

app.post('/players', router.addAllPlayers);
app.post('/matches', router.scrape);
app.post('/players/rank', rankPlayers);

//testing
// app.post('/matches', (req, res) => {
//   res.send(req.body.scrapeAll);
// });

app.listen(3000, function () {
  console.log('Squash app listening on port 3000!');
});