'use strict';

const express = require('express');
const router = express.Router();
const schemaService = require('./../services/schemaService');
const util = require('./../utilities/util');

router.get('/fields', (req, res) => {
    schemaService.getSchema((err, data) => {
        if (err) {
            return res.status(util.schemaErrorToHTTP(err.status)).json(util.generateErrorJSON(util.schemaErrorToHTTP(err.status), err.message));
        }
        return res.status(200).json(data);
    });
});

router.get('/fields/:name', (req, res) => {
    schemaService.getField(req.params.name, (err, data) => {
        if (err) {
            return res.status(util.schemaErrorToHTTP(err.status)).json(util.generateErrorJSON(util.schemaErrorToHTTP(err.status), err.message));
        }
        return res.status(200).json(data);
    });
});

router.delete('/fields/:name', (req, res) => {
    schemaService.deleteField(req.params.name, (err, data) => {
        if (err) {
            return res.status(util.schemaErrorToHTTP(err.status)).json(util.generateErrorJSON(util.schemaErrorToHTTP(err.status), err.message));
        }
        return res.status(204).end();
    });
});

router.post('/fields/:name', (req, res) => {
    schemaService.addField(req.params.name, req.body, (err, data) => {
        if (err) {
            return res.status(util.schemaErrorToHTTP(err.status)).json(util.generateErrorJSON(util.schemaErrorToHTTP(err.status), err.message));
        }
        return res.status(201).json(data);
    });
});

router.put('/fields/:name', (req, res) => {
    schemaService.updateField(req.params.name, req.body, (err, data) => {
        if (err) {
            return res.status(util.schemaErrorToHTTP(err.status)).json(util.generateErrorJSON(util.schemaErrorToHTTP(err.status), err.message));
        }
        return res.status(200).json(data);
    });
});

module.exports = router;
