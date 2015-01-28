var dbconfig = require("./config.json").dbconnection;
var httpConfig = require("./config.json").http;

var mongodb   = require('mongodb');
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

console.log("Init...");

//DB config
var DbServer = mongodb.Server;
var Db = mongodb.Db;
var dbServer = new DbServer(dbconfig.host, dbconfig.port);
var db = new Db(dbconfig.dbName, dbServer, { safe: true });


// Website config
var app = express();

app.set('view engine', 'jade');
app.set('port', httpConfig.listenPort || 8080);



// Make our db accessible to our router
app.use(function (req, res, next) {
    req.db = db;
    next();
});



app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

/// catch 404 and forwarding to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

console.log("Starting...");