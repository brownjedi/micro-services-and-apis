'use strict';

const async = require('async');
const schemaService = require('./schemaService');
const Student = schemaService.Student;
const StudentHistory = schemaService.StudentHistory;

function findOne(query, callback) {
    Student.getModel().findOne(query).exec((error, studentDoc) => {
        return callback(error, studentDoc);
    });
}

function findOneById(id, callback) {
    Student.getModel().findOne({
        studentID: id
    }).exec((error, studentDoc) => {
        return callback(error, studentDoc);
    });
}

function find(query, callback) {
    Student.getModel().find(query).exec((error, studentDoc) => {
        return callback(error, studentDoc);
    });
}

function findOneFromHistory(query, callback) {
    StudentHistory.getModel().findOne(query).sort({
        version: -1
    }).exec((error, studentHistoryDoc) => {
        return callback(error, studentHistoryDoc);
    });
}

function findOneByIdFromHistory(id, callback) {
    StudentHistory.getModel().findOne({
        studentID: id
    }).sort({
        version: -1
    }).exec((error, studentHistoryDoc) => {
        return callback(error, studentHistoryDoc);
    });
}

function findFromHistory(query, callback) {
    StudentHistory.getModel().find(query).sort({
        version: -1
    }).exec((error, studentHistoryDoc) => {
        return callback(error, studentHistoryDoc);
    });
}

function addStudent(data, callback) {
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

        let student = new (Student.getModel())(temp);
        student.save((error, studentDoc) => {
            return callback(error, studentDoc);
        });
    });
}

function deleteStudent(id, callback) {
    Student.getModel().remove({
        studentID: id
    }).exec((error) => {
        return callback(error);
    });
}

function addCourseToStudent(id, courseID, callback) {
    findOneById(id, (err, student) => {
        if (err) {
            return callback(err);
        }

        if (student) {
            student.version = Date.now();
            student.courses = student.courses || [];
            student.courses.push(courseID);
            student.save((error, studentDoc) => {
                return callback(error, studentDoc);
            });
        } else {
            let err = new Error();
            err.status = 'DB_ERROR_RESOURCE_NOT_FOUND';
            err.message = 'The request resource is not found';
            return callback(err);
        }
    });
}

function removeCourseFromStudent(id, courseID, callback) {
    findOneById(id, (err, student) => {
        if (err) {
            return callback(err);
        }

        if (student) {
            student.version = Date.now();
            student.courses = student.courses || [];
            let index = student.courses.indexOf(courseID);
            if (index > -1) {
                student.courses.splice(index, 1);
            }
            student.save((error, studentDoc) => {
                return callback(error, studentDoc);
            });
        } else {
            let err = new Error();
            err.status = 'DB_ERROR_RESOURCE_NOT_FOUND';
            err.message = 'The request resource is not found';
            return callback(err);
        }
    });
}

function updateStudent(id, data, callback) {
    async.parallel([
        schemaService.getSchema,
        async.apply(findOneById, id)
    ], (err, result) => {
        if (err) {
            return callback(err);
        }

        let schemaJson = result[0];
        let student = result[1];

        if (student) {

            for (let key in schemaJson.schema) {
                if (schemaJson.schema.hasOwnProperty(key)) {
                    student[key] = data[key];
                }
            }

            student.version = Date.now();

            student.save((error, studentDoc) => {
                return callback(error, studentDoc);
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

        let studentHistory = new (StudentHistory.getModel())(temp);
        studentHistory.save((error, studentHistoryDoc) => {
            return callback(error, studentHistoryDoc);
        });
    });
}

module.exports.findOne = findOne;
module.exports.findOneById = findOneById;
module.exports.find = find;
module.exports.addStudent = addStudent;
module.exports.updateStudent = updateStudent;
module.exports.deleteStudent = deleteStudent;
module.exports.validateInput = validateInput;
module.exports.revertFromHistory = revertFromHistory;
module.exports.saveHistory = saveHistory;
module.exports.addCourseToStudent = addCourseToStudent;
module.exports.removeCourseFromStudent = removeCourseFromStudent;