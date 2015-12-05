'use strict';

const express = require('express');
const router = express.Router();
const databaseService = require('./../services/databaseService');
const util = require('./../utilities/util');

function handleCourseAddedToStudentError(event, cb) {
    if (event.data && event.data.studentID && event.data.courseID) {
        async.waterfall([
            async.apply(databaseService.findOne, event.data.studentID), 
            (data, callback) => {
                if (data && data.version && event.version === data.version) {
                    databaseService.revertFromHistory(event.data.studentID, callback);
                } else {
                    return callback();
                }
            }
        ], cb);
    } else {
        return cb();
    }
}

function handleCourseDeletedFromStudentError(event, cb) {
    return cb();
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
        });
    }
});

module.exports = router;
