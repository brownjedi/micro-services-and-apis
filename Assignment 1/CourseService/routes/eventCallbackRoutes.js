'use strict';

// Module dependencies
const express = require('express');
const router = express.Router();
const Course = require('./../models/course');
const CourseHistory = require('./../models/courseHistory');
const async = require('async');

function handleCourseAddition(event) {
    let courseID = event.data.courseID;
    let studentID = event.data.studentID;

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
        } else {
            // Emit an error
        }

    });

}

function handleCourseDeletion(event) {

    let courseID = event.data.courseID;
    let studentID = event.data.studentID;

    Course.findOne({
        courseID: courseID
    }, (err, course) => {
        if (err) {
            return console.log('Error Occurred while handling course deletion', err);
        }
        if (course) {
            course.students = (course.students || []);
            let index = course.students.indexOf(studentID);
            if (index > -1) {
                course.students.splice(index, 1);
                course.save();
            }
        }
    });
}

function handleStudentAdditionError(event) {

    let courseID = event.data.courseID;
    let studentID = event.data.studentID;
    let version = event.version;

    let course;

    async.waterfall([
        function(callback) {
            Course.findOne({
                courseID: courseID
            }, callback);
        },
        function(callback, result) {
            if (result && result.version === version) {
            	course = result;
                CourseHistory.findOne({
                    courseID: courseID
                }, callback);
            } else {
            	callback(true);
            }
        },
        function(callback, courseHistory) {
        	
        }
    ], (err, result) => {

    });

}

function handleStudentDeletionError(event) {

}

router.post('/', (req, res) => {

    if (req.body && req.body.type && req.body.data) {

        switch (req.body.type.toUpperCase()) {
            case 'COURSE_ADDED_TO_STUDENT':
                handleCourseAddition(req.body);
                break;
            case 'COURSE_DELETED_FROM_STUDENT':
                handleCourseDeletion(req.body);
                break;
            case 'STUDENT_ADDED_TO_COURSE_ERROR':
                handleStudentAdditionError(req.body);
                break;
            case 'STUDENT_DELETED_FROM_COURSE_ERROR':
                handleStudentDeletionError(req.body);
                break;
        }
        return res.status(204).end();
    } else {
        return res.status(400).end();
    }
});

module.exports = router;

// iterate through the studnet list and update accordingly
