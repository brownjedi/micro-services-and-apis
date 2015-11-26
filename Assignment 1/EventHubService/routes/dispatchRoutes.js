'use strict';

const express = require('express');
const router = express.Router();
const request = require('superagent');
const databaseService = require('./../services/databaseService');
const util = require('./../utilities/util');

router.post('/', (req, res) => {

    // Check if the user sent the event in the request body.
    // If not, return 400 Bad request error.
    if (!req.body || !req.body.type) {
        return res.status(400).sendData(util.generateErrorJSON(400, "Bad Request, Request body is null. The POST method must have the data(JSON) in the Request body"));
    }

    // Get the list of subscriptions from the database and dispatch the event.
    databaseService.find({}, (err, subscriptions) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        } else {
            res.status(204).end();
        }

        subscriptions.forEach((subscription) => {
            if (subscription.events.indexOf(req.body.type.toLowerCase()) > -1) {

                // Do the Request
                let headers = JSON.parse(JSON.stringify(req.headers));
                // Delete Content Length....It's causing issues
                delete headers['content-length'];
                delete headers['host'];

                let internalRequest = request.post(subscription.callback).set(headers);

                if (req.body && Object.keys(req.body).length > 0) {
                    internalRequest.send(req.body);
                }

                internalRequest.end();
            }
        });
    });

});

module.exports = router;