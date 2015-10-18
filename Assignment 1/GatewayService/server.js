"use strict";

// Module dependencies
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const database = require('./config/database');
const urlMappingRoutes = require('./routes/urlMappingRoutes');
const urlMapping = require('./models/urlMapping');

// Set the MongoDB connection
let connection = mongoose.connect(process.env.mongoDBURL || database.url);

autoIncrement.initialize(connection);
urlMapping.urlMappingSchema.plugin(autoIncrement.plugin, {
    model: urlMapping.urlMappingCollection,
    field: 'mapping_id',
    startAt: 1,
    incrementBy: 1
});

let app = express();

app.set('port', process.env.PORT || 3000);


// Setting up the middleware services
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

console.log("Before rerouting");
// setting all the routes
app.use('/spi/v1/routes', urlMappingRoutes);

console.log("After rerouting");
// catch 404 and forward it to error handler
app.use((req, res, next) => {
    let err = new Error('404: Not Found');
    err.status = 404;
    next(err);
});

// Error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    return res.json(err.message);
});

// Start the server and listen to the port specified
app.listen(app.get('port'), () => {
    console.log(`API Gateway Express Server started on port: ${app.get('port')}`);
});

