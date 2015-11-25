'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const url = require('url');
const request = require('request');
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

        async.map(matchedUrlMappings, (item, next) => {

            let url = item.urlMapping.targetUrl;

            for (let key in item.matcherObj.parameters) {
                if (item.matcherObj.parameters.hasOwnProperty(key)) {
                    url = url.replace(':' + key, item.matcherObj.parameters[key])
                }
            }

            url = url + item.matcherObj.search;

            console.log(url, req.method, req.body);

            // Do the Request
            request({
                url: url,
                method: req.method,
                body: JSON.stringify(req.body),
                headers: {
                    'Content-Type': req.get('Content-Type')
                }
            }, (error, response) => {
                if (error) {
                    return next();
                }
                if (response.statusCode < 400) {
                    return next(null, response.body);
                } else {
                    console.log(response.body);
                    return next();
                }
            });

        }, (err, result) => {
            if (err) {
                return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
            }

            return res.status(200).sendData(util.generateMergedUrlRoutingResult(req.originalUrl, result));
        });

    });

});


module.exports = router;