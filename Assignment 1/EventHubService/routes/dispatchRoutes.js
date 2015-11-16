'use strict';

// Module dependencies
const express = require('express');
const router = express.Router();
const request = require('superagent');
const Subscription = require('./../models/subscription');
const dataTransformer = require('./../utilities/dataTransformer');

router.post('/', (req, res) => {

    // Check if the user sent the event in the request body.
    // If not, return 400 Bad request error.
    if (!req.body || !req.body.type) {
        return res.status(400).json(dataTransformer.transformError(400, "Bad Request, Request body is null. The POST method must have the data(JSON) in the Request body"));
    }

    // Get the list of subscriptions from the database and dispatch the event.
    Subscription.find({}, (err, subscriptions) => {
        if (err) {
            return res.status(400).json(dataTransformer.transformError(err.status, err.message));
        } else {
            res.status(204).end();
        }

        subscriptions.forEach((subscription) => {
            if (subscription.events.indexOf(req.body.type.toLowerCase()) > -1) {
                request
                    .post(subscription.callback)
                    .set('Content-Type', 'application/json')
                    .end();
            }
        });
    });
});

module.exports = router;
