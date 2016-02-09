/**
 * Dependencies 
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookies = require( "cookies" )
var session = require('express-session');

/**
 * Create Express setup and configuration
 */
global.app = express();

app.set('port', process.env.PORT || 63357);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookies.express());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'foobar', // <- this should be a random number or something, but for testing this will be enough
    saveUninitialized: true,
    resave: true
}));

// set the environment to development
var env = process.env.NODE_ENV || 'development';

/**
 * Controllers
 */
var wgCashController = require('./controllers/cash')(__dirname + '/data/');
var errorController = require('./controllers/error')();

/**
 * Routes
 */
app.get('/', function(res, req, next) { req.render('index', { title: 'WG Title Page'}); });

app.get('/cash', wgCashController.showCashPage);
app.post('/cash', wgCashController.addNewEntry);

/**
 * Error Handling
 */
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

/**
 * Run Server
 */
app.listen(app.get('port'), function() {
    console.log("> Express server listening on http://localhost:%d", app.get('port'));
});
