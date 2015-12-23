'use strict';

const express = require('express');
const router = express.Router();
const util = require('./../utilities/util');
const queueService = require('./../services/queueService');
const databaseService = require('./../services/databaseService');
const async = require('async');

router.post('*', (req, res) => {

    async.waterfall([
        async.apply(queueService.validateInput, req.body),
        function (data, callback) {
            databaseService.find({}, callback);
        },
        function (urlMappings, callback) {

            let matchedUrlMappings = util.getMatchedUrls(req.url, urlMappings);

            // Check if the URL is not matched to any templateURL
            if (matchedUrlMappings.length === 0) {
                let err = new Error();
                err.status = 404;
                err.message = '404: URL Not Found';
                return callback(err);
            }

            console.log(matchedUrlMappings);

            async.map(matchedUrlMappings, (item, next) => {
                if (item.queueUrl) {
                    let queueUrl = util.removeAdditionalSlashes(item.queueUrl);
                    queueService.addMessageToQueue(req.body, queueUrl, function (error, response) {
                        let status = 201;
                        if (error) {
                            status = error.status || 201;
                        }

                        return next(null, {
                            status: status,
                            body: {
                                routeName: item.name,
                                response: response
                            }
                        });
                    });
                } else {
                    return next(null, {
                        status: 500,
                        body: {
                            routeName: item.name,
                            response: "Internal Server Error...The Route doesn't have a queueUrl defined. Contact your Administrator to add the Queue URL for the particular microservice"
                        }
                    });
                }

            }, callback);
        }
    ], (err, result) => {
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

        return res.status(temp[0].status).sendData(util.generateMergedQueueResult(temp));
    });
});

module.exports = router;
