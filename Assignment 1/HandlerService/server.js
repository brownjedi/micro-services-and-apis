'use strict';

// Module dependencies
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var handlerRoutes = require('./routes/handlerRoutes');

// Set the MongoDB connection
mongoose.connect(process.env.mongoDBURL || require('./config/database').url);
mongoose.set('debug', true);

var app = express();

app.set('port', process.env.PORT || process.env.VCAP_APP_PORT || 3000);

// Setting up the middleware services
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// setting all the routes
app.use('/', handlerRoutes);


// catch 404 and forward it to error handler
app.use(function(req, res, next) {
    var err = new Error('404: Not Found');
    err.status = 404;
    next(err);
});

// Error Handler
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    return res.json(err.message);
});

// Start the server and listen to the port specified
app.listen(app.get('port'), function() {
    console.log('Handler Express Server started on port: ' + app.get('port'));
});