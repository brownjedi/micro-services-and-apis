'use strict';

const express = require('express');
const router = express.Router();
const schemaService = require('./../services/schemaService');
const util = require('./../utilities/util');

router.get('/fields', (req, res) => {
    schemaService.getSchema((err, data) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).json(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        return res.status(200).json(util.generateSchemaJSON(data));
    });
});

router.get('/fields/:name', (req, res) => {
    schemaService.getField(req.params.name, (err, data) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).json(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        return res.status(200).json(util.generateFieldJSON(req.params.name, data));
    });
});

module.exports = router;
