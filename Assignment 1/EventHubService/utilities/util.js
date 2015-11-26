'use strict';

const schemaService = require('./../services/schemaService');
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

function generateSubscriptionJSON(results, callback) {

    function generateSubscription(subscription, schemaJson) {
        if (subscription) {
            let output = {
                resourceType: "subscription",
                subscriptionID: subscription.subscriptionID,
                version: subscription.version,
                data: {}
            };

            for (let key in schemaJson.schema) {
                if (schemaJson.schema.hasOwnProperty(key)) {
                    let isHidden = schemaJson.schema[key].hidden || false;

                    if (isHidden) {
                        continue;
                    }

                    if (key !== 'subscriptionID' && key !== 'version') {
                        output.data[key] = subscription[key];
                    }
                }
            }

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
                resourceType: "subscriptions",
                "subscriptions": []
            };
            results.forEach((result) => {
                data.subscriptions.push(generateSubscription(result, schemaJson));
            });
            data.link = {
                rel: "self",
                href: `/api/v1/subscriptions`
            }
        } else {
            data = generateSubscription(results, schemaJson);
            data.link = {
                rel: "self",
                href: `/api/v1/subscriptions/${results.subscriptionID}`
            };
        }
        return callback(null, data);
    });
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

module.exports.auth = auth;
module.exports.generateErrorJSON = generateErrorJSON;
module.exports.customErrorToHTTP = customErrorToHTTP;
module.exports.generateSchemaJSON = generateSchemaJSON;
module.exports.generateFieldJSON = generateFieldJSON;
module.exports.generateSubscriptionJSON = generateSubscriptionJSON;
