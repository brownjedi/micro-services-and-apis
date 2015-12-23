'use strict';

const schemaService = require('./../services/schemaService');
const _ = require('lodash');
const basicAuth = require('basic-auth');

function generateErrorJSON(status, message) {
    return {
        resourceType: "error",
        errors: [{
            version: "v1",
            status: status,
            message: message
        }]
    };
}

function customErrorToHTTP(errorStatus) {
    let errorMap = {
        'SCHEMA_ERROR_RESOURCE_NOT_FOUND': 404,
        'SCHEMA_ERROR_INTERAL_ERROR': 500,
        'SCHEMA_ERROR_RESOURCE_CONFLICT': 409,
        'SCHEMA_ERROR_UNAUTHORIZED': 401,
        'SCHEMA_ERROR_VALIDATION_CHECK_FAILED': 400,
        'SCHEMA_ERROR_BAD_INPUT_REQUEST': 400,
        'SCHEMA_ERROR_FORBIDDEN': 403,
        'DB_ERROR_RESOURCE_NOT_FOUND': 404,
        'DB_ERROR_BAD_INPUT_REQUEST': 400
    };

    if (!isNaN(errorStatus)) {
        return errorStatus;
    }

    return errorMap[errorStatus] || 500;
}

function generateFieldJSON(fieldName, data) {
    let output = {};
    if (data && data.schema && data.schema[fieldName]) {
        output.resourceType = 'field';
        output.data = {
            fieldName: fieldName,
            type: data.schema[fieldName].type,
            hidden: data.schema[fieldName].hidden || false,
            required: data.schema[fieldName].required || false,
            systemLevel: data.schema[fieldName].systemLevel || false
        };
        output.link = {
            rel: 'self',
            href: `/spi/v1/schema/fields/${fieldName}`
        };
    }
    return output;
}

function generateSchemaJSON(data) {

    let output = {};
    if (data && data.schema) {
        output.resourceType = 'schema';
        output.data = {};
        output.data.schemaName = data.schemaName;
        output.data.collectionName = data.collectionName;
        output.data.version = data.version;
        output.data.fields = [];

        for (let key in data.schema) {
            if (data.schema.hasOwnProperty(key)) {
                output.data.fields.push(generateFieldJSON(key, data));
            }
        }

        output.link = {
            rel: 'self',
            href: `/spi/v1/schema/fields`
        };
    }
    return output;
}

function generateUrlMappingJSON(results, callback) {

    function generateUrlMapping(urlMapping, schemaJson) {
        if (urlMapping) {
            let output = {
                resourceType: "urlMapping",
                urlMappingID: urlMapping.urlMappingID,
                version: urlMapping.version,
                data: {}
            };

            for (let key in schemaJson.schema) {
                if (schemaJson.schema.hasOwnProperty(key)) {
                    let isHidden = schemaJson.schema[key].hidden || false;

                    if (isHidden) {
                        continue;
                    }

                    if (key !== 'urlMappingID' && key !== 'version') {
                        output.data[key] = urlMapping[key];
                    }
                }
            }

            output.link = {
                rel: "self",
                href: `/spi/v1/urlMappings/${urlMapping.urlMappingID}`
            };

            return output;
        } else {
            return {};
        }
    }

    schemaService.getSchema((err, schemaJson) => {
        if (err) {
            return callback(err);
        }
        let data = {};
        if (results.constructor === Array) {
            data = {
                resourceType: "urlMappings",
                "urlMappings": []
            };
            results.forEach((result) => {
                data.urlMappings.push(generateUrlMapping(result, schemaJson));
            });
            data.link = {
                rel: "self",
                href: `/spi/v1/urlMappings`
            }
        } else {
            data = generateUrlMapping(results, schemaJson);
        }
        return callback(null, data);
    });
}


function removeAdditionalSlashes(data) {

    let temp = data;

    if (temp.charAt(0) === '/') {
        temp = temp.substring(1, temp.length);
    }

    if (temp.charAt(temp.length - 1) === '/') {
        temp = temp.substring(0, temp.length - 1);
    }

    return temp;
}

function generateMergedQueueResult(result) {

    let finalResult = {
    };

    if(result && result.length > 0) {

        finalResult.queueResponses = [];

        for (let i = 0; i < result.length; i++) {
            finalResult.queueResponses.push(result[i].body);
        }
    }

    return finalResult;
}

function generateMergedUrlRoutingResult(originalUrl, result) {

    let finalResult = {};

    for (let i = 0; i < result.length; i++) {
        finalResult = _.merge(finalResult, JSON.parse(JSON.stringify(result[i].body)), function (a, b) {
            if (_.isArray(a)) {
                return a.concat(b);
            }
        });
    }

    if (finalResult && finalResult.link) {
        finalResult.link = {
            rel: 'self',
            href: originalUrl
        }
    }

    return finalResult;
}

function auth(req, res, next) {
    function unauthorized(res) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        return res.status(401).sendData(generateErrorJSON(401, 'User is not authorized'));
    }

    let user = basicAuth(req);

    if (!user || !user.name || !user.pass) {
        return unauthorized(res);
    }

    if (user.name === 'developer' && user.pass === 'awesome') {
        return next();
    } else {
        return unauthorized(res);
    }
}

function getMatchedUrls(url, urlMappings) {

    let matchedUrlMappings = [];

    url = removeAdditionalSlashes(url);

    urlMappings.forEach((urlMapping) => {
        if ((url.search(new RegExp(urlMapping.regex)) !== -1)) {
            matchedUrlMappings.push(urlMapping);
        }
    });

    return matchedUrlMappings;
}

module.exports.auth = auth;
module.exports.generateErrorJSON = generateErrorJSON;
module.exports.customErrorToHTTP = customErrorToHTTP;
module.exports.generateSchemaJSON = generateSchemaJSON;
module.exports.generateFieldJSON = generateFieldJSON;
module.exports.generateUrlMappingJSON = generateUrlMappingJSON;
module.exports.removeAdditionalSlashes = removeAdditionalSlashes;
module.exports.generateMergedUrlRoutingResult = generateMergedUrlRoutingResult;
module.exports.getMatchedUrls = getMatchedUrls;
module.exports.generateMergedQueueResult = generateMergedQueueResult;