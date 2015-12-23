'use strict';

const path = require('path');
const schemaPath = path.join(__dirname, './../schema/urlMappingSchema.json');
const UrlMapping = require('./../databaseModels/urlMapping')(schemaPath);

let schemaJson = require(schemaPath);

function getField(fieldName, callback) {
    if (schemaJson.schema[fieldName]) {
        return callback(null, schemaJson);
    } else {
        let err = new Error();
        err.status = 'SCHEMA_ERROR_RESOURCE_NOT_FOUND';
        err.message = 'The request resource is not found';
        return callback(err);
    }
}

function getSchema(callback) {
    return callback(null, schemaJson);
}

module.exports.UrlMapping = UrlMapping;

module.exports.getField = getField;
module.exports.getSchema = getSchema;
