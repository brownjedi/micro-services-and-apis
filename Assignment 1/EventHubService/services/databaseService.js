'use strict';

const async = require('async');
const schemaService = require('./schemaService');
const Subscription = schemaService.Subscription;

function findOne(query, callback) {
    Subscription.getModel().findOne(query).exec((error, subscriptionDoc) => {
        return callback(error, subscriptionDoc);
    });
}

function findOneById(id, callback) {
    Subscription.getModel().findOne({
        subscriptionID: id
    }).exec((error, subscriptionDoc) => {
        return callback(error, subscriptionDoc);
    });
}

function find(query, callback) {
    Subscription.getModel().find(query).exec((error, subscriptionDoc) => {
        return callback(error, subscriptionDoc);
    });
}

function addSubscription(data, callback) {
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

        let subscription = new (Subscription.getModel())(temp);
        subscription.save((error, subscriptionDoc) => {
            return callback(error, subscriptionDoc);
        });
    });
}

function deleteSubscription(id, callback) {
    Subscription.getModel().remove({
        subscriptionID: id
    }).exec((error) => {
        return callback(error);
    });
}

function updateSubscription(id, data, callback) {
    async.parallel([
        schemaService.getSchema,
        async.apply(findOneById, id)
    ], (err, result) => {
        if (err) {
            return callback(err);
        }

        let schemaJson = result[0];
        let subscription = result[1];

        if (subscription) {

            for (let key in schemaJson.schema) {
                if (schemaJson.schema.hasOwnProperty(key)) {
                    subscription[key] = data[key];
                }
            }

            subscription.version = Date.now();

            subscription.save((error, subscriptionDoc) => {
                return callback(error, subscriptionDoc);
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

                if (key === 'subscriptionID') {
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

        temp.subscriptionID = id;
        delete temp.createdAt;
        delete temp.updatedAt;
        delete temp.version;

        return callback(null, temp);
    });
}

module.exports.findOne = findOne;
module.exports.findOneById = findOneById;
module.exports.find = find;
module.exports.addSubscription = addSubscription;
module.exports.updateSubscription = updateSubscription;
module.exports.deleteSubscription = deleteSubscription;
module.exports.validateInput = validateInput;