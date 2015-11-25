'use strict';

const express = require('express');
const router = express.Router();
const schemaService = require('./../services/schemaService');
const util = require('./../utilities/util');

router.get('/fields', (req, res) => {
    schemaService.getSchema((err, data) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        return res.status(200).sendData(util.generateSchemaJSON(data));
    });
});

router.get('/fields/:name', (req, res) => {
    schemaService.getField(req.params.name, (err, data) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        return res.status(200).sendData(util.generateFieldJSON(req.params.name, data));
    });
});

router.delete('/fields/:name', (req, res) => {
    schemaService.deleteField(req.params.name, (err, data) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        return res.status(204).end();
    });
});

router.post('/fields/:name', (req, res) => {
    let data = undefined;
    if (req.body && req.body.data) {
        data = req.body.data;
    }
    schemaService.addField(req.params.name, data, (err, data) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        return res.status(201).sendData(util.generateFieldJSON(req.params.name, data));
    });
});

router.put('/fields/:name', (req, res) => {
    let data = undefined;
    if (req.body && req.body.data) {
        data = req.body.data;
    }
    schemaService.updateField(req.params.name, data, (err, data) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        return res.status(200).sendData(util.generateFieldJSON(req.params.name, data));
    });
});

module.exports = router;
