'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const url = require('url');
const request = require('superagent');
const databaseService = require('./../services/databaseService');
const util = require('./../utilities/util');

router.all('*', (req, res) => {

    databaseService.find({}, (err, urlMappings) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }

        let matchedUrlMappings = util.getMatchedUrls(req.url, urlMappings);

        // Check if the URL is not matched to any templateURL
        if (matchedUrlMappings.length === 0) {
            return res.status(404).sendData(util.generateErrorJSON(404, '404: URL Not Found'));
        }

        console.log(matchedUrlMappings);

        async.map(matchedUrlMappings, (item, next) => {

            let url = util.removeAdditionalSlashes(item.targetUrl) + '/' + util.removeAdditionalSlashes(req.url);

            // Do the Request
            let headers = JSON.parse(JSON.stringify(req.headers));

            // Delete Content Length....It's causing issues
            delete headers['content-length'];
            delete headers['host'];
            headers.accept = 'application/json';

            console.log(headers);

            let internalRequest = request(req.method, url).set(headers);

            if (req.body && Object.keys(req.body).length > 0) {
                internalRequest.send(req.body);
            }

            internalRequest.end((error, response) => {
                return next(null, {
                    status: response.statusCode,
                    body: response.body
                });
            });

        }, (err, result) => {
            if (err) {
                return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
            }

            console.log('Result', result);

            let successResponsePresent = false;
            for (let i = 0; i < result.length; i++) {
                if (result[i].status < 400) {
                    successResponsePresent = true;
                    break;
                }
            }

            let temp = [];
            if (successResponsePresent) {
                for (let i = 0; i < result.length; i++) {
                    if (result[i].status < 400) {
                        temp.push(result[i]);
                    }
                }
            } else {
                temp = result;
            }

            return res.status(temp[0].status).sendData(util.generateMergedUrlRoutingResult(req.originalUrl, temp));
        });

    });

});


module.exports = router;