'use strict';

const path = require('path');
const fs = require('fs');
const schemaPath = path.join(__dirname, './../schema/subscriptionSchema.json');
const Subscription = require('./../databaseModels/subscription')(schemaPath);

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

function refreshModels() {
    Subscription.refreshModel();
}

module.exports.Subscription = Subscription;

module.exports.getField = getField;
module.exports.getSchema = getSchema;
module.exports.refreshModels = refreshModels;
