'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const url = require('url');
const request = require('request');
const _ = require('lodash');
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

router.all('*', (req, res) => {

    databaseService.find({
        "httpMethod": req.method
    }, (err, urlMappings) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }

        async.map(urlMappings, (urlMapping, next) => {

            let matcherObj = urlMatcher(req.url, urlMapping.templateUrl);

            if (matcherObj.isMatch) {

                let id;

                for (let key in matcherObj.parameters) {
                    if (matcherObj.parameters.hasOwnProperty(key)) {
                        id = matcherObj.parameters[key];
                        break;
                    }
                }

                if (id && id.search(new RegExp(urlMapping.regex)) === -1) {
                    return next();
                }

                let url = urlMapping.targetUrl;

                for (let key in matcherObj.parameters) {
                    if (matcherObj.parameters.hasOwnProperty(key)) {
                        url = url.replace(':' + key, matcherObj.parameters[key])
                    }
                }

                url = url + matcherObj.search;

                console.log(url);
                request({
                    url: url,
                    method: req.method,
                    data: req.body,
                    headers: {
                        'Content-Type': req.get('Content-Type')
                    }
                }, (error, response) => {
                    if (error) {
                        return next();
                    }

                    if (response.statusCode < 300) {
                        return next(null, response.body);
                    } else {
                        return next();
                    }
                });
            } else {
                return next();
            }

        }, (err, result) => {
            if (err) {
                return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
            }

            let temp = [];

            for (let i = 0; i < result.length; i++) {
                if (result[i] !== null && result[i] !== undefined) {
                    temp.push(result[i]);
                }
            }

            let finalResult = {};

            for (let i = 0; i < temp.length; i++) {
                finalResult = _.merge(finalResult, JSON.parse(temp[i]), function (a, b) {
                    if (_.isArray(a)) {
                        return a.concat(b);
                    }
                });
            }

            if(finalResult && finalResult.link) {
                finalResult.link = {
                    rel: 'self',
                    href: req.originalUrl
                }
            }

            return res.status(200).sendData(finalResult);
        });

    });

});


module.exports = router;