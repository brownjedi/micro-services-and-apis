'use strict';

// Module dependencies
const express = require('express');
const router = express.Router();
const async = require('async');
const Subscription = require('./../models/subscription');
const dataTransformer = require('./../utilities/dataTransformer');

router.post('/', (req, res) => {

	// Check if the user sent the event in the request body.
	// If not, return 400 Bad request error.
    if (!req.body || !req.body.type) {
        return res.status(400).json(dataTransformer.transformError(400, "Bad Request, Request body is null. The POST method must have the data(JSON) in the Request body"));
    }
});

module.exports = router;

