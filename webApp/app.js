
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , bodyParser = require('body-parser')
  , favicon = require('serve-favicon')
  , logger = require('morgan')
  , methodOverride = require('method-override');

var app = express();

const benchmarkPricePerf = require("./controllers/benchmarksController");

app.set('port', process.env.PORT || 3000);
app.use(favicon(__dirname + '/public/images/favicon.png'));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(express.json())

const db = require ("./config/db");

if (app.get('env') == 'development') {
  app.locals.pretty = true;
}

// Routes

/**
 * @BENCHMARKS
 */
app.post('/api/benchmarks', function(req, res) {
  console.log("POST /api/benchmarks")
  benchmarkPricePerf.benchmarkPricePerf(req, res, db);
});


// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
