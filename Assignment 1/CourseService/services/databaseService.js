'use strict';

const async = require('async');
const schemaService = require('./schemaService');
const Course = schemaService.Course;
const CourseHistory = schemaService.CourseHistory;

function findOne(query, callback) {
    Course.getModel().findOne(query).exec((error, courseDoc) => {
        return callback(error, courseDoc);
    });
}

function findOneById(id, callback) {
    Course.getModel().findOne({
        courseID: id
    }).exec((error, courseDoc) => {
        return callback(error, courseDoc);
    });
}

function find(query, callback) {
    Course.getModel().find(query).exec((error, courseDoc) => {
        return callback(error, courseDoc);
    });
}

function findOneFromHistory(query, callback) {
    CourseHistory.getModel().findOne(query).sort({
        version: -1
    }).exec((error, courseHistoryDoc) => {
        return callback(error, courseHistoryDoc);
    });
}

function findOneByIdFromHistory(id, callback) {
    CourseHistory.getModel().findOne({
        courseID: id
    }).sort({
        version: -1
    }).exec((error, courseHistoryDoc) => {
        return callback(error, courseHistoryDoc);
    });
}

function findFromHistory(query, callback) {
    CourseHistory.getModel().find(query).sort({
        version: -1
    }).exec((error, courseHistoryDoc) => {
        return callback(error, courseHistoryDoc);
    });
}

function addCourse(data, callback) {
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

        let course = new (Course.getModel())(temp);
        course.save((error, courseDoc) => {
            return callback(error, courseDoc);
        });
    });
}

function deleteCourse(id, callback) {
    Course.getModel().remove({
        courseID: id
    }).exec((error) => {
        return callback(error);
    });
}

function updateCourse(id, data, callback) {
    async.parallel([
        schemaService.getSchema,
        async.apply(findOneById, id)
    ], (err, result) => {
        if (err) {
            return callback(err);
        }

        let schemaJson = result[0];
        let course = result[1];

        if (course) {

            for (let key in schemaJson.schema) {
                if (schemaJson.schema.hasOwnProperty(key)) {
                    course[key] = data[key];
                }
            }

            course.version = Date.now();

            course.save((error, courseDoc) => {
                return callback(error, courseDoc);
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
                let fieldType = fieldSchema.type;

                if (key === 'courseID') {
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

        temp.courseID = id;
        delete temp.createdAt;
        delete temp.updatedAt;
        delete temp.version;

        return callback(null, temp);
    });
}

function revertFromHistory(id, callback) {
    async.series([
        async.apply(findOneById, id),
        async.apply(findOneByIdFromHistory, id)
    ], (err, result) => {
        if (err) {
            return callback(err);
        }
        // TODO

    });
}

function saveHistory(id, callback) {
    async.parallel([
        async.apply(findOneById, id),
        schemaService.getSchema
    ], (err, result) => {
        if (err) {
            return callback(err);
        }

        let schemaJson = result[1];
        let data = result[0];


        let temp = {};
        for (let key in schemaJson.schema) {
            if (schemaJson.schema.hasOwnProperty(key)) {
                temp[key] = data[key];
                let isRequired = schemaJson.schema[key].required || false;
                let fieldType = schemaJson.schema[key].type;
                if (fieldType.constructor === Array) {
                    fieldType = 'Array';
                }

                if (isRequired && (data[key] === undefined || data[key] === null)) {
                    switch (fieldType) {
                        case "Boolean":
                            temp[key] = false;
                            break;
                        case "Number":
                            temp[key] = -1;
                            break;
                        case "String":
                            temp[key] = "";
                            break;
                        case "Date":
                            temp[key] = '1970-01-01';
                            break;
                        case "Array":
                            temp[key] = [];
                            break;
                    }
                }
            }
        }

        let courseHistory = new (CourseHistory.getModel())(temp);
        courseHistory.save((error, courseHistoryDoc) => {
            return callback(error, courseHistoryDoc);
        });
    });
}

module.exports.findOne = findOne;
module.exports.findOneById = findOneById;
module.exports.find = find;
module.exports.addCourse = addCourse;
module.exports.updateCourse = updateCourse;
module.exports.deleteCourse = deleteCourse;
module.exports.validateInput = validateInput;
module.exports.revertFromHistory = revertFromHistory;
module.exports.saveHistory = saveHistory;
