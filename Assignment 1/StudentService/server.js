'use strict';

// Module dependencies
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');
const EasyXml = require('easyxml');
const mongoose = require('mongoose');
const studentRoutes = require('./routes/studentRoutes');
const schemaRoutes = require('./routes/schemaRoutes');
const eventCallbackRoutes = require('./routes/eventCallbackRoutes');
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
app.use(xmlparser());

let serializer = new EasyXml({
    singularizeChildren: true,
    allowAttributes: true,
    rootElement: 'response',
    dateFormat: 'ISO',
    indent: 2,
    manifest: true
});

app.use(function (req, res, next) {
    res.sendData = function (obj) {
        if (req.accepts('json') || req.accepts('text/html')) {
            res.header('Content-Type', 'application/json');
            res.send(obj);
        } else if (req.accepts('application/xml')) {
            res.header('Content-Type', 'text/xml');
            res.send(serializer.render(obj));
        } else {
            res.send(406);
        }
    };
    next();
});

// setting all the routes and schema changes required
app.use('/api/v1/students', studentRoutes);
app.use('/spi/v1/schema', schemaRoutes);
app.use('/api/v1/eventCallback', eventCallbackRoutes);

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
    console.log(`Student Express Server started on port: ${app.get('port')}`);
});
