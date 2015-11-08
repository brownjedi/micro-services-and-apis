'use strict';

// Module dependencies
const express = require('express');
const router = express.Router();
const Course = require('./../models/course');
const CourseHistory = require('./../models/courseHistory');
const dataFormatConverter = require('./../utilities/converter');

// CRUD OPERATIONS
// 1. GET
router.get('/', (req, res) => {
    Course.find({}, (err, courses) => {
        if (err) {
            return res.status(500).json(dataFormatConverter.transformError("500", err.message));
        }
        return res.status(200).json(dataFormatConverter.courseDBToJSON(courses));
    });
});

// *
router.get('/:id', (req, res) => {
    Course.findOne({
        courseID: req.params.id
    }, (err, course) => {
        console.log(course);
        if (err) {
            return res.status(500).json(dataFormatConverter.transformError("500", err.message));
        }
        if (!course) {
            return res.status(404).json(dataFormatConverter.transformError("404", "Resource not found"));
        } else {
            return res.status(200).json(dataFormatConverter.courseDBToJSON(course));
        }
    });
});


// 2. POST
router.post('/', (req, res) => {
    let data = req.body;

    if (data && data.name) {

        if (data.students && !(data.students instanceof Array)) {
            return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request. Students should be an Array"));
        }

        // Check if the course is already present with same name
        Course.findOne({
            name: data.name
        }, (err, course) => {
            if (err) {
                return res.status(400).json(dataFormatConverter.transformError("500", err.message));
            } else if (course) {
                return res.status(409).json(dataFormatConverter.transformError("409", "Error. The resource with the same name already exists"));
            } else {
                let course = new Course({
                    name: data.name,
                    instructor: data.instructor,
                    location: data.location,
                    dayTime: data.dayTime,
                    enrollment: {
                        current: data.enrollment.current,
                        max: data.enrollment.max
                    },
                    students: data.students,
                    version: Date.now()
                });
                course.save((err, result) => {
                    if (err) {
                        return res.status(500).json(dataFormatConverter.transformError("500", err.message));
                    } else {
                        return res.status(201).json(dataFormatConverter.courseDBToJSON(result));
                    }
                });
            }
        });

    } else {
        return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request."));
    }
});


// 3. PUT
router.put('/:id', (req, res) => {
    let body = req.body;

    if (body && body.data && body.data.name) {

        if (body.data.students && !(body.data.students instanceof Array)) {
            return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request"));
        }

        Course.findOne({
            courseID: req.params.id
        }, (err, course) => {
            if (err) {
                return res.status(500).json(dataFormatConverter.transformError("404", err.message));
            }
            if (!course) {
                return res.status(404).json(dataFormatConverter.transformError("404", "Resource not found"));
            } else {
                let courseHistory = new CourseHistory({
                    courseID: course.courseID,
                    name: course.name,
                    instructor: course.instructor,
                    location: course.location,
                    dayTime: course.dayTime,
                    enrollment: course.enrollment,
                    students: course.students,
                    version: course.version,
                    createdAt: course.createdAt,
                    updatedAt: course.updatedAt
                });
                courseHistory.save((err, result) => {
                    if (err) {
                        return res.status(500).json(dataFormatConverter.transformError("500", err.message));
                    } else {

                        course.name = body.data.name;
                        course.instructor = body.data.instructor;
                        course.location = body.data.location;
                        course.dayTime = body.data.dayTime;
                        course.enrollment = body.data.enrollment;
                        course.students = body.data.students;
                        course.version = Date.now();

                        course.save((err, updatedCourse) => {

                            // Emit an Event

                            if (err) {
                                return res.status(500).json(dataFormatConverter.transformError("500", err.message));
                            } else {
                                return res.status(200).json(dataFormatConverter.courseDBToJSON(updatedCourse));
                            }

                        });
                    }
                });
            }
        });
    } else {
        return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request"));
    }
});

// 4. DELETE
router.delete('/:id', (req, res) => {
    Course.findOne({
        courseID: req.params.id
    }, (err, course) => {
        if (err) {
            return res.status(500).send(dataFormatConverter.transformError("500", err.message));
        }
        if (course) {

            let courseHistory = new CourseHistory({
                courseID: course.courseID,
                name: course.name,
                instructor: course.instructor,
                location: course.location,
                dayTime: course.dayTime,
                enrollment: course.enrollment,
                students: course.students,
                version: course.version,
                createdAt: course.createdAt,
                updatedAt: course.updatedAt
            });

            courseHistory.save((err, result) => {
                if (err) {
                    return res.status(500).json(dataFormatConverter.transformError("500", err.message));
                } else {
                    course.remove((err) => {
                        if (err) {
                            return res.status(500).json(dataFormatConverter.transformError(500, err.message));
                        } else {

                            // Emit Event

                            return res.status(204).end();
                        }
                    })
                }
            });
        } else {
            return res.status(404).send(dataFormatConverter.transformError("404", "Resource not found"));
        }
    });

});

module.exports = router;
