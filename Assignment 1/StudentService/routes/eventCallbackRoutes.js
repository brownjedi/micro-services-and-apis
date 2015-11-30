'use strict';

const express = require('express');
const router = express.Router();
const databaseService = require('./../services/databaseService');
const util = require('./../utilities/util');

function handleCourseAddedToStudentError(event, callback) {
    if (event.data && event.data.studentID && event.data.courseID) {
        async.waterfall([

        ], (err, result) => {

        });
    } else {
        return callback();
    }
}

function handleCourseDeletedFromStudentError(event, callback) {
    if (event.data && event.data.studentID && event.data.courseID) {

    } else {
        return callback();
    }
}

function handleStudentAddedToCourse(event, callback) {
    if (event.data && event.data.studentID && event.data.courseID) {
        return databaseService.addCourseToStudent(event.data.studentID, event.data.courseID, callback);
    } else {
        let err = new Error();
        err.status = '404';
        err.message = 'The request resource is not found';
        return callback(err);
    }
}

function handleStudentDeletedFromCourse(event, callback) {
    if (event.data && event.data.studentID && event.data.courseID) {
        return databaseService.removeCourseFromStudent(event.data.studentID, event.data.courseID, callback);
    } else {
        return callback();
    }
}

router.post('/', (req, res) => {

    let events = req.body;
    // Send the response as soon as you receive it, then process it.
    res.status(201).end();

    if (events && events.constructor === Array) {

        async.map(events, (event, next) => {

            if (event.type) {

                switch (event.type) {
                    case 'COURSE_ADDED_TO_STUDENT_ERROR':
                        handleCourseAddedToStudentError(event, next);
                        break;
                    case 'COURSE_DELETED_FROM_STUDENT_ERROR':
                        handleCourseDeletedFromStudentError(event, next);
                        break;
                    case 'STUDENT_ADDED_TO_COURSE':
                        handleStudentAddedToCourse(event, next);
                        break;
                    case 'STUDENT_DELETED_FROM_COURSE':
                        handleStudentDeletedFromCourse(event, next);
                        break;
                    default:
                        return next();
                }
            } else {
                return next();
            }
        }, (err, results) => {
            if (err) {
                return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
            }

        });
    }
});

module.exports = router;