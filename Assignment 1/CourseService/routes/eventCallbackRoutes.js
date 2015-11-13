'use strict';

// Module dependencies
const express = require('express');
const router = express.Router();
const Course = require('./../models/course');
const CourseHistory = require('./../models/courseHistory');
const async = require('async');
const dataFormatConverter = require('./../utilities/converter');

var errorObject;
var temp;

function handleCourseAddition(event, res) {
    let courseID = event.data.courseID;
    let studentID = event.data.studentID;
    let version = event.version;
    let type;

    Course.findOne({
        courseID: courseID
    }, (err, course) => {
        if (err) {
            return console.log('Error Occurred while handling course addition', err);
        }
        if (course) {
            course.students = (course.students || []);
            course.students.push(studentID);
            course.save();
            return res.send(dataFormatConverter.eventGenerator('COURSE_ADDED_TO_STUDENT_SUCCESSFUL', courseID, studentID, version));

        } else {
            // create an error obejct and emit it to Course Handler URI
            return res.send(dataFormatConverter.eventGenerator('COURSE_ADDED_TO_STUDENT_ERROR', courseID, studentID, version));
        }

    });

}

function handleCourseDeletion(event, res) {
    let courseID = event.data.courseID;
    let studentID = event.data.studentID;
    let version = event.version;
    let type = event.type;

    Course.findOne({
            courseID: courseID
        }, (err, course) => {
            if (err) {
                return console.log('Error Occurred while handling course deletion', err);
            }
            if (course) {

                course.students = (course.students || []);
                let index = course.students.indexOf(studentID);
                console.log(index);

                if (index > -1) {
                    console.log("inside index");
                    course.students.splice(index, 1);
                    course.save((err) => {
                        if (err) {
                            return res.send(err);
                        }
                    });
                }
                CourseHistory.findOne({
                        courseID: courseID
                    }, (err, courseHistory) => {
                        if (courseHistory) {
                            let courseHistory = new CourseHistory({
                                courseID: courseID,
                                name: course.name,
                                instructor: course.instructor,
                                location: course.location,
                                dayTime: course.dayTime,
                                enrollment: course.enrollment,
                                students: course.students,
                                version: version,
                                createdAt: course.createdAt,
                                updatedAt: course.updatedAt
                            });

                            courseHistory.save((err)) => {
                                if (err) {
                                    return res.send(err);
                                }
                            });
                    }
                });

            return res.send(dataFormatConverter.eventGenerator('COURSE_DELETED_TO_STUDENT_SUCCESSFUL', courseID, studentID, version));
        }
    });
}

function handleStudentAdditionError(event) {

    let courseID = event.data.courseID;
    let studentID = event.data.studentID;
    let version = event.version;

    async.waterfall([
        function(callback) {
            Course.findOne({
                courseID: courseID
            }, callback);
        },
        function(course, callback) {
            if (course && course.version === version) {
                CourseHistory.findOne({
                    courseID: courseID
                }, function(err, courseHistory) {
                    if (err) {
                        return callback(err);
                    } else {
                        callback(null, course, courseHistory);
                    }
                });
            } else {
                callback(true);
            }
        },
        function(course, courseHistory, callback) {
            // check if courseHistory is null....if its null...then delete course
            // else course.name = courseHistory.name and then course.save -> courseHistory.remove
            if (courseHistory) { // checking if not null or undefined

                course.courseID = courseHistory.courseID;
                course.name = courseHistory.name;
                course.instructor = bcourseHistory.instructor;
                course.location = courseHistory.location;
                course.dayTime = courseHistory.dayTime;
                course.enrollment = courseHistory.enrollment;
                course.students = courseHistory.students;
                course.version = courseHistory.version;

                course.save((err, result) => {
                    if (err) {
                        return callback(err);
                    } else {
                        courseHistory.remove(callback);
                    }
                });
            } else {
                course.remove(callback);
            }
        }
    ], (err) => {
        if (err) {
            console.log(err);
        }
    });

}


router.post('/', (req, res) => {
    console.log("inside post method");

    if (req.body && req.body.type && req.body.data) {

        switch (req.body.type.toUpperCase()) {
            case 'COURSE_ADDED_TO_STUDENT':
                return handleCourseAddition(req.body, res);
                break;

            case 'COURSE_DELETED_FROM_STUDENT':
                return handleCourseDeletion(req.body, res);
                break;

            case 'STUDENT_ADDED_TO_COURSE_ERROR':
                handleStudentAdditionError(req.body);
                break;
        }
    } else {
        return res.status(400).end();
    }
});

module.exports = router;