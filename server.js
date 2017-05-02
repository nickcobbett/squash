var express = require('express');
var app = express();
// var bodyParser = require('body-parser');
var scrape = require('./scraper.js').scrape;

app.get('/', scrape);

app.listen(3000, function () {
  console.log('Squash app listening on port 3000!');
});