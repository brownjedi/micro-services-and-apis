'use strict';

// Module dependencies
const express = require('express');
const router = express.Router();
const Student = require('./../models/student');
const StudentHistory = require('./../models/studentHistory');
const async = require('async');
const dataFormatConverter = require('./../utilities/converter');

function handleStudentAddition(event, res) {
    let courseID = event.data.courseID;
    let studentID = event.data.studentID;
    let version = event.version;

    Student.findOne({
        studentID: studentID
    }, (err, student) => {

        if (err) {
            return console.log('Error Occurred while handling student addition', err);
        }

        if (student) {
            student.courses = (student.courses || []);
            student.courses.push(courseID);
            student.save((err) => {
                if (err) {
                    return res.send(err);
                }
            });
            return res.send(dataFormatConverter.eventGenerator('STUDENT_ADDED_TO_COURSE_SUCCESS', studentID, courseID, version));
        } else {
            return res.send(dataFormatConverter.eventGenerator('STUDENT_ADDED_TO_COURSE_ERROR', courseID, studentID, version));
        }

    });
}

function handleStudentDeletion(event, res) {

    let courseID = event.data.courseID;
    let studentID = event.data.studentID;
    let version = event.version;
    let type;

    Student.findOne({
        studentID: studentID
    }, (err, student) => {
        if (err) {
            return console.log('Error Occurred while handling student deletion', err);
        }

        if (student) {
            student.courses = (student.courses || []);
            let index = student.courses.indexOf(courseID);
            if (index > -1) {
                student.courses.splice(index, 1);
                student.save((err) => {
                    if (err) {
                        return res.status(400).send(err);
                    }
                });
            }
            return res.send(dataFormatConverter.eventGenerator('STUDENT_DELETED_FROM_COURSES_SUCCESS', studentID, courseID, version));
        }
    });
}

function handleCourseAdditionError(event) {
    let courseID = event.data.courseID;
    let studentID = event.data.studentID;
    let version = event.version;

    async.waterfall([
        function(callback) {
            Student.findOne({
                studentID: studentID
            }, callback);
        },
        function(callback, student) {
            if (student && student.version === version) {
                StudentHistory.findOne({
                    studentID: studentID
                }, function(err, studentHistory) {
                    if (err) {
                        return callback(err);
                    } else {
                        callback(null, student, studentHistory);
                    }
                });
            } else {
                callback(true);
            }
        },
        function(callback, student, studentHistory) {
            // check if studentHistory is null....if its null...then delete student
            // else student.name = studentHistory.name and then student.save -> courseHistory.remove
            if (studentHistory) { // checking if not null or undefined
                student.studentID = studentHistory.studentID,
                student.name.firstName = studentHistory.name.firstName,
                student.name.lastName = studentHistory.name.lastName
                student.degree = studentHistory.degree,
                student.major = studentHistory.major,
                student.courses = studentHistory.courses,
                student.version = studentHistory.version
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

    if (req.body && req.body.data && req.body.type) {

        switch (req.body.type.toUpperCase()) {
            case 'STUDENT_ADDED_TO_COURSE':
                return handleStudentAddition(req.body, res);
                break;
            case 'STUDENT_DELETED_FROM_COURSE':
                return handleStudentDeletion(req.body, res);
                break;
            case 'COURSE_ADDED_TO_STUDENT_ERROR':
                return handleCourseAdditionError(req.body);
                break;
        }
    } else {
        return res.status(400).end();
    }
});

module.exports = router;
