'use strict';

const async = require('async');
const schemaService = require('./schemaService');
const K12 = schemaService.K12;

function processDynamoResponse(k12Obj) {
    delete k12Obj.lastKey;
    if(k12Obj.constructor === Array && k12Obj.length <= 1) {
        k12Obj = k12Obj[0];
    }
    return k12Obj;
}

function findOne(query, callback) {
    K12.getModel().query(query).exec((error, k12Obj) => {
        k12Obj = processDynamoResponse(k12Obj);
        return callback(error, k12Obj);
    });
}

function findOneById(id, callback) {
    K12.getModel().query({
        studentID: id
    }).exec((error, k12Obj) => {
        k12Obj = processDynamoResponse(k12Obj);
        return callback(error, k12Obj);
    });
}

function find(query, callback) {
    K12.getModel().scan(query).exec((error, k12Obj) => {
        delete k12Obj.lastKey;
        return callback(error, k12Obj);
    });
}

function addK12Object(data, callback) {
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
        temp.createdAt = Date.now();
        temp.updatedAt = Date.now();

        let k12 = new (K12.getModel())(temp);
        k12.save((error, k12Obj) => {
            k12Obj = processDynamoResponse(k12Obj);
            return callback(error, k12Obj);
        });
    });
}

function deleteK12Object(id, callback) {
    K12.getModel().delete({
        studentID: id
    }, (error) => {
        return callback(error);
    });
}

function updateK12Object(id, data, callback) {
    async.parallel([
        schemaService.getSchema,
        async.apply(findOneById, id)
    ], (err, result) => {
        if (err) {
            return callback(err);
        }

        let schemaJson = result[0];
        let k12 = result[1];

        if (k12) {

            for (let key in schemaJson.schema) {
                if (schemaJson.schema.hasOwnProperty(key)) {
                    k12[key] = data[key];
                }
            }

            k12.version = Date.now();
            k12.updatedAt = Date.now();

            k12.save((error, k12Obj) => {
                k12Obj = processDynamoResponse(k12Obj);
                return callback(error, k12Obj);
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

                if (key === 'studentID') {
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

        temp.studentID = id;

        return callback(null, temp);
    });
}

module.exports.findOne = findOne;
module.exports.findOneById = findOneById;
module.exports.find = find;
module.exports.addK12Object = addK12Object;
module.exports.updateK12Object = updateK12Object;
module.exports.deleteK12Object = deleteK12Object;
module.exports.validateInput = validateInput;
