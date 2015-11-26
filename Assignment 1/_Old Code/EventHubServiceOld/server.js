'use strict';

// Module dependencies
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');;
const dispatchRoutes = require('./routes/dispatchRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const dataTransformer = require('./utilities/dataTransformer');

// Set the MongoDB connection
mongoose.connect(process.env.mongoDBURL || require('./config/database').url);
mongoose.set('debug', true);

let app = express();

app.set('port', process.env.PORT || process.env.VCAP_APP_PORT || 3000);

// Setting up the middleware services
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

// setting all the routes
app.use('/api/v1/eventhub/dispatch', dispatchRoutes);
app.use('/api/v1/eventhub/subscriptions', subscriptionRoutes);

// catch 404 and forward it to error handler
app.use((req, res, next) => {
    let err = new Error('404: Not Found. The Requested URL does not exist');
    err.status = 404;
    next(err);
});

// Error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    return res.json(dataTransformer.transformError(err.status || 500, err.message));
});

// Start the server and listen to the port specified
app.listen(app.get('port'), () => {
    console.log(`EventHub Express Server started on port: ${app.get('port')}`);
});
