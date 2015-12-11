'use strict';

const async = require('async');
const schemaService = require('./schemaService');
const Finance = schemaService.Finance;

function findOne(query, callback) {
    Finance.getModel().findOne(query).exec((error, financeDoc) => {
        return callback(error, financeDoc);
    });
}

function findOneById(id, callback) {
    Finance.getModel().findOne({
        financeID: id
    }).exec((error, financeDoc) => {
        return callback(error, financeDoc);
    });
}

function find(query, callback) {
    Finance.getModel().find(query).exec((error, financeDoc) => {
        return callback(error, financeDoc);
    });
}

function addFinance(data, callback) {
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

        let finance = new Finance.getModel()(temp);
        finance.save((error, financeDoc) => {
            return callback(error, financeDoc);
        });
    });
}

function deleteFinance(id, callback) {
    Finance.getModel().remove({
        financeID: id
    }).exec((error) => {
        return callback(error);
    });
}

function updateFinance(id, data, callback) {
    async.parallel([
        schemaService.getSchema,
        async.apply(findOneById, id)
    ], (err, result) => {
        if (err) {
            return callback(err);
        }

        let schemaJson = result[0];
        let finance = result[1];

        if (finance) {

            for (let key in schemaJson.schema) {
                if (schemaJson.schema.hasOwnProperty(key)) {
                    finance[key] = data[key];
                }
            }

            finance.version = Date.now();

            finance.save((error, financeDoc) => {
                return callback(error, financeDoc);
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

                if (key === 'financeID') {
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

        temp.financeID = id;
        delete temp.createdAt;
        delete temp.updatedAt;
        delete temp.version;

        return callback(null, temp);
    });
}

module.exports.findOne = findOne;
module.exports.findOneById = findOneById;
module.exports.find = find;
module.exports.addFinance = addFinance;
module.exports.updateFinance = updateFinance;
module.exports.deleteFinance = deleteFinance;
module.exports.validateInput = validateInput;
