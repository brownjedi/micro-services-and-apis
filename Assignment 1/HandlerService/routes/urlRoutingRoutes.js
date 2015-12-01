'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const url = require('url');
const request = require('superagent');
const databaseService = require('./../services/databaseService');
const util = require('./../utilities/util');


function urlMatcher(inputUrl, templateUrl) {

    inputUrl = util.removeAdditionalSlashes(inputUrl);
    templateUrl = util.removeAdditionalSlashes(templateUrl);

    let output = {
        isMatch: false,
        parameters: {},
        search: ""
    };

    let parsedInputUrl = url.parse(inputUrl);

    output.search = parsedInputUrl.search || "";

    let inputUrlParts = inputUrl.split('/');
    let templateUrlParts = templateUrl.split('/');

    if (inputUrlParts.length !== templateUrlParts.length) {
        return output;
    }

    for (let i = 0; i < inputUrlParts.length; i++) {

        if (inputUrlParts[i] === templateUrlParts[i]) {
            if (i === inputUrlParts.length - 1) {
                output.isMatch = true;
            }
            continue;
        }

        if (inputUrlParts[i] !== templateUrlParts[i] && templateUrlParts[i].charAt(0) === ':') {
            output.parameters[templateUrlParts[i].substring(1, templateUrlParts[i].length)] = inputUrlParts[i];
            if (i === inputUrlParts.length - 1) {
                output.isMatch = true;
            }
        } else {
            break;
        }
    }

    return output;
}

function getMatchedUrls(url, urlMappings) {

    let matchedUrlMappings = [];

    urlMappings.forEach((urlMapping) => {
        let matcherObj = urlMatcher(url, urlMapping.templateUrl);

        if (matcherObj.isMatch) {
            let id;

            for (let key in matcherObj.parameters) {
                if (matcherObj.parameters.hasOwnProperty(key)) {
                    id = matcherObj.parameters[key];
                    break;
                }
            }

            if (id) {
                if (id.search(new RegExp(urlMapping.regex)) !== -1) {
                    matchedUrlMappings.push({
                        urlMapping: urlMapping,
                        matcherObj: matcherObj
                    });
                }
            } else {
                matchedUrlMappings.push({
                    urlMapping: urlMapping,
                    matcherObj: matcherObj
                });
            }
        }

    });

    return matchedUrlMappings;
}


router.all('*', (req, res) => {

    databaseService.find({
        "httpMethod": req.method
    }, (err, urlMappings) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }

        let matchedUrlMappings = getMatchedUrls(req.url, urlMappings);

        // Check if the URL is not matched to any templateURL
        if (matchedUrlMappings.length === 0) {
            return res.status(404).sendData(util.generateErrorJSON(404, '404: URL Not Found'));
        }

        console.log(matchedUrlMappings);

        async.map(matchedUrlMappings, (item, next) => {

            let url = item.urlMapping.targetUrl;

            for (let key in item.matcherObj.parameters) {
                if (item.matcherObj.parameters.hasOwnProperty(key)) {
                    url = url.replace(':' + key, item.matcherObj.parameters[key])
                }
            }

            url = url + item.matcherObj.search;

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

            console.log('finalresult', result);

            let successResponsePresent = false;
            for(let i = 0; i < result.length; i++) {
                if(result[i].status < 400) {
                    successResponsePresent = true;
                    break;
                }
            }

            let temp = [];
            if(successResponsePresent) {
                for(let i = 0; i < result.length; i++) {
                    if(result[i].status < 400) {
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