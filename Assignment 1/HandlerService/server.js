'use strict';

// Module dependencies
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const urlMappingRoutes = require('./routes/urlMappingRoutes');
const schemaRoutes = require('./routes/schemaRoutes');
const eventCallbackRoutes = require('./routes/eventCallbackRoutes');
const urlRoutingRoutes = require('./routes/urlRoutingRoutes');
const util = require('./utilities/util');

// Set the MongoDB connection
mongoose.connect(process.env.mongoDBURL || require('./config/databaseUrl.json').url);
mongoose.set('debug', true);

let app = express();

app.set('port', process.env.PORT || process.env.VCAP_APP_PORT || 3000);

// Setting up the middleware services
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// setting all the routes and schema changes required
app.use('/spi/v1/urlMappings', urlMappingRoutes);
app.use('/spi/v1/schema', schemaRoutes);
app.use('/api/v1/eventCallback', eventCallbackRoutes);
app.use('/api/v1/urlRouting', urlRoutingRoutes);

// catch 404 and forward it to error handler
app.use((req, res, next) => {
    let err = new Error('404: URL Not Found');
    err.status = 404;
    next(err);
});

// Error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    return res.json(util.generateErrorJSON(err.status, err.message));
});

// Start the server and listen to the port specified
app.listen(app.get('port'), () => {
    console.log(`Handler Express Server started on port: ${app.get('port')}`);
});
