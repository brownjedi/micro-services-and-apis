'use strict';

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

function schemaErrorToHTTP(errorStatus) {
    let errorMap = {
        'SCHEMA_ERROR_RESOURCE_NOT_FOUND': 404,
        'SCHEMA_ERROR_INTERAL_ERROR': 500,
        'SCHEMA_ERROR_RESOURCE_CONFLICT': 409,
        'SCHEMA_ERROR_UNAUTHORIZED': 401,
        'SCHEMA_ERROR_VALIDATION_CHECK_FAILED': 400,
        'SCHEMA_ERROR_BAD_INPUT_REQUEST': 400,
        'SCHEMA_ERROR_FORBIDDEN': 403
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
            href: `/spi/v1/courses/schema/fields/${fieldName}`
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
        output.data.historyCollectionName = data.historyCollectionName;
        output.data.version = data.version;
        output.data.fields = [];

        for (let key in data.schema) {
            if (data.schema.hasOwnProperty(key)) {
                output.data.fields.push(generateFieldJSON(key, data));
            }
        }

        output.link = {
            rel: 'self',
            href: `/spi/v1/courses/schema/fields`
        };
    }
    return output;
}

function resourceExists(data, callback) {
    if (data) {
        return callback(null, data);
    } else {
        let err = new Error();
        err.status = 404;
        err.message = 'The request resource is not found';
        return callback(err);
    }
}

function resourceDoesNotExists(data, callback) {
    if (!data) {
        return callback();
    } else {
        let err = new Error();
        err.status = 409;
        err.message = 'The request resource already exists';
        return callback(err);
    }
}

module.exports.generateErrorJSON = generateErrorJSON;
module.exports.generateSchemaJSON = generateSchemaJSON;
module.exports.generateFieldJSON = generateFieldJSON;
module.exports.schemaErrorToHTTP = schemaErrorToHTTP;
module.exports.resourceExists = resourceExists;
module.exports.resourceDoesNotExists = resourceDoesNotExists;
