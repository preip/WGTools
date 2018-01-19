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
 * Configuration file
 */
var fs = require('fs');
//try {
    //fs.accessSync(__dirname + '/config.json', fs.F_OK | fs.R_OK);
//} catch(err) {
if (fs.existsSync(__dirname + '/config.json') == false) {
    console.log('> ERROR: Config file doesn\'t exist or doesn\'t have read permissions.');
    console.log('  Please execute "createExpampleData.js" to create all neccessary data objects.');
    process.exit();
}

try {
    var raw = fs.readFileSync(__dirname + '/config.json', 'utf8');
    global.config = JSON.parse(raw);    
} catch(err) {
    console.log('> ERROR: Config file can\'t be parsed correctly.');
    console.log('  Please make sure that "config.json" is a valid json-file.');
    process.exit();
}

/**
 * Create Express setup and configuration
 */
global.app = express();
app.set('port', process.env.PORT || config.port);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookies.express());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: config.sessionSeed,
    saveUninitialized: true,
    resave: true
}));

// set the environment to development
var env = process.env.NODE_ENV || 'development';

app.use(function(req,res,next) {
    if (req.session !== undefined && req.session.loggedIn !== undefined) {
        res.locals.loggedIn = req.session.loggedIn;
        res.locals.username = req.session.username;
    } else {
        res.locals.loggedIn = false;
    }
    next();
});
// This is used for url parsing in the middle of a jade template
app.locals.url = require('url');

/**
 * Data-Controller
 */
global.accountData = require('./controllers/accountData')(path.join(__dirname, config.dataPath));
var cashPoolData = require('./controllers/cashPoolsData')(path.join(__dirname, config.dataPath, 'cashPools'));
var settlementsData = require('./controllers/settlementsData')(path.join(__dirname, config.dataPath), cashPoolData)
/**
 * View-Models
 */
var accountController = require('./controllers/accountPresenter')();
var cashPoolsController = require('./controllers/cashPoolsPresenter')(cashPoolData, settlementsData);
var calendarController = require('./controllers/calendar')(path.join(__dirname, config.dataPath));
var shoppingListController = require('./controllers/shoppingList')(path.join(__dirname, config.dataPath));
var errorController = require('./controllers/error')();

/**
 * Routes
 */
app.get('/', function(res, req, next) { req.render('index', { title: 'WG Title Page'}); });
// Accounts
app.get('/login', accountController.loginGet);
app.post('/login', accountController.loginPost);
app.get('/logout', accountController.logoutGet);
app.get('/account/changePassword', accountController.isAuthenticated, accountController.changePasswordGet);
app.post('/account/changePassword', accountController.isAuthenticated, accountController.changePasswordPost);
app.get('/account/create', accountController.isAuthenticated, accountController.createAccountGet);
app.post('/account/create', accountController.isAuthenticated, accountController.createAccountPost);
app.get('/account/delete', accountController.isAuthenticated, accountController.deleteAccountGet);
app.post('/account/delete', accountController.isAuthenticated, accountController.deleteAccountPost);
// CashPools
app.get('/cashPools', accountController.isAuthenticated, cashPoolsController.showCashPoolsIndex);
app.post('/cashPools', accountController.isAuthenticated, cashPoolsController.addNewPool);
app.get('/cashPools/:id', accountController.isAuthenticated, cashPoolsController.showCashPool);
app.post('/cashPools/:id', accountController.isAuthenticated, cashPoolsController.addNewEntryToPool);
app.post('/cashPools/:id/setState', accountController.isAuthenticated, cashPoolsController.setState);
app.post('/cashPools/:id/toggleUserState', accountController.isAuthenticated, cashPoolsController.toggleUserState);
app.post('/settlements', accountController.isAuthenticated, cashPoolsController.addNewSettlement);
// Shopping List
app.get('/shoppingList', accountController.isAuthenticated, shoppingListController.showShoppingListPage);
app.get('/shoppingList/GetAll', accountController.isAuthenticated, shoppingListController.getAll);
app.post('/shoppingList/Create', accountController.isAuthenticated, shoppingListController.addNewEntry);
app.post('/shoppingList/Update', accountController.isAuthenticated, shoppingListController.updateEntry);
app.delete('/shoppingList/Delete', accountController.isAuthenticated, shoppingListController.deleteEntry);
// Calendar
app.get('/calendar', accountController.isAuthenticated, calendarController.showCalendar);
app.post('/calendar/Save', accountController.isAuthenticated, calendarController.saveEvents);

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
    console.log("> Express server listening on http://localhost/WGTool:%d", app.get('port'));
});
