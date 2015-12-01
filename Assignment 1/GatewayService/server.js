'use strict';

// Module dependencies
const express = require('express');
const logger = require('morgan');
const bodyParser = require('body-parser');
const xmlparser = require('express-xml-bodyparser');
const EasyXml = require('easyxml');
const mongoose = require('mongoose');
const urlMappingRoutes = require('./routes/urlMappingRoutes');
const schemaRoutes = require('./routes/schemaRoutes');
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

var xml2jsDefaults = {
    explicitArray: false,
    normalize: false,
    normalizeTags: false,
    trim: true
};

app.use(xmlparser(xml2jsDefaults));

let serializer = new EasyXml({
    singularizeChildren: true,
    allowAttributes: true,
    rootElement: 'root',
    dateFormat: 'ISO',
    indent: 2,
    manifest: true
});

app.use((req, res, next) => {
    res.sendData = function (obj) {
        if (req.accepts('json') || req.accepts('text/html')) {
            res.header('Content-Type', 'application/json');
            res.send(obj);
        } else if (req.accepts('application/xml')) {
            res.header('Content-Type', 'application/xml');
            obj = JSON.parse(JSON.stringify(obj));
            res.send(serializer.render(obj));
        } else {
            res.send(util.generateErrorJSON(406, 'Not acceptable'));
        }
    };
    next();
});

app.use((req, res, next) => {
    if ((req.header('Content-Type') === 'text/xml' || req.header('Content-Type') === 'application/xml') && req.body) {
        req.body = req.body.root;
    }
    next();
});

// setting all the routes and schema changes required
app.use('/spi/v1/urlMappings', urlMappingRoutes);
app.use('/spi/v1/schema', schemaRoutes);
app.use('/synapse', urlRoutingRoutes);

// catch 404 and forward it to error handler
app.use((req, res, next) => {
    let err = new Error('404: URL Not Found');
    err.status = 404;
    next(err);
});

// Error Handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    return res.sendData(util.generateErrorJSON(err.status, err.message));
});

// Start the server and listen to the port specified
app.listen(app.get('port'), () => {
    console.log(`Handler Express Server started on port: ${app.get('port')}`);
});
