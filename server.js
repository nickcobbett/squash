var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var router = require('./routeHelpers.js');

app.use(bodyParser.json());

app.get('/', router.scrape);

app.post('/players/', router.addPlayer);

app.post('/matches', router.addMatch);

app.listen(3000, function () {
  console.log('Squash app listening on port 3000!');
});