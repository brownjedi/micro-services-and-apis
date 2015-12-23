'use strict';

const async = require('async');
const schemaService = require('./schemaService');
const UrlMapping = schemaService.UrlMapping;
const util = require('./../utilities/util');

function findOne(query, callback) {
    UrlMapping.getModel().findOne(query).exec((error, urlMappingDoc) => {
        return callback(error, urlMappingDoc);
    });
}

function findOneById(id, callback) {
    UrlMapping.getModel().findOne({
        urlMappingID: id
    }).exec((error, urlMappingDoc) => {
        return callback(error, urlMappingDoc);
    });
}

function find(query, callback) {
    UrlMapping.getModel().find(query).exec((error, urlMappingDoc) => {
        return callback(error, urlMappingDoc);
    });
}

function addUrlMapping(data, callback) {
    schemaService.getSchema((err, schemaJson) => {
        if (err) {
            return callback(err);
        }

        let temp = {};
        for (let key in schemaJson.schema) {
            if (schemaJson.schema.hasOwnProperty(key)) {
                temp[key] = data[key];
            }
        }

        temp.version = Date.now();

        let urlMapping = new (UrlMapping.getModel())(temp);
        urlMapping.save((error, urlMappingDoc) => {
            return callback(error, urlMappingDoc);
        });
    });
}

function deleteUrlMapping(id, callback) {
    UrlMapping.getModel().remove({
        urlMappingID: id
    }).exec((error) => {
        return callback(error);
    });
}

function updateUrlMapping(id, data, callback) {
    async.parallel([
        schemaService.getSchema,
        async.apply(findOneById, id)
    ], (err, result) => {
        if (err) {
            return callback(err);
        }

        let schemaJson = result[0];
        let urlMapping = result[1];

        if (urlMapping) {

            for (let key in schemaJson.schema) {
                if (schemaJson.schema.hasOwnProperty(key)) {
                    urlMapping[key] = data[key];
                }
            }

            urlMapping.version = Date.now();

            urlMapping.save((error, urlMappingDoc) => {
                return callback(error, urlMappingDoc);
            });
        } else {
            let err = new Error();
            err.status = 'DB_ERROR_RESOURCE_NOT_FOUND';
            err.message = 'The request resource is not found';
            return callback(err);
        }
    });
}

function validateInput(id, data, callback) {

    function generateBadRequestError(message) {
        let err = new Error();
        err.status = 'DB_ERROR_BAD_INPUT_REQUEST';
        err.message = message || 'Bad Request';
        return err;
    }

    schemaService.getSchema((err, schemaJson) => {

        if (err) {
            return callback(err);
        }

        // Check if the data is not undefined or null
        if (!data) {
            return callback(generateBadRequestError('The Request doesnot have a proper JSON'));
        }

        let temp = {};

        // Validate the type first
        for (let key in schemaJson.schema) {
            if (schemaJson.schema.hasOwnProperty(key)) {
                let fieldSchema = schemaJson.schema[key];

                let isFieldRequired = fieldSchema.required || false;

                if (key === 'urlMappingID') {
                    continue;
                }

                // Validate if the field is required and if the user has given it as input
                if (isFieldRequired && (data[key] === undefined || data[key] === null)) {
                    return callback(generateBadRequestError(`Bad Request. The field ${key} is required but not given in the input.`));
                }
                // fieldType is automatically validated by mongoose
                temp[key] = data[key];
            }
        }

        temp.urlMappingID = id;
        delete temp.createdAt;
        delete temp.updatedAt;
        delete temp.version;

        return callback(null, temp);
    });
}

module.exports.findOne = findOne;
module.exports.findOneById = findOneById;
module.exports.find = find;
module.exports.addUrlMapping = addUrlMapping;
module.exports.updateUrlMapping = updateUrlMapping;
module.exports.deleteUrlMapping = deleteUrlMapping;
module.exports.validateInput = validateInput;