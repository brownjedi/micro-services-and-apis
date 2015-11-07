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
    let data = req.body;

    if (data && data.name) {

        if (data.students && !(data.students instanceof Array)) {
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

                        course.name = data.name;
                        course.instructor = data.instructor;
                        course.location = data.location;
                        course.dayTime = data.dayTime;
                        course.enrollment = data.enrollment;
                        course.students = data.students;
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


router.get('/:id/students', (req, res) => {

    let course_ID = req.params.id;
    Course.findOne({
        courseID: course_ID
    }, (err, course) => {

        if (err) {
            return res.status(500).json(dataFormatConverter.transformError("500", err.message));
        }

        if (course) {
            course.name = course.name;
            course.instructor = course.instructor;
            course.location = course.location;
            course.dayTime = course.dayTime;
            course.enrollment = course.enrollment;
            course.students = course.students;
            course.version = Date.now();
            return res.status(200).json(dataFormatConverter.courseDBToJSON(course));
        } else {
            return res.status(404).send(dataFormatConverter.transformError("404", "Resource not found"));
        }

    });

});


router.delete('/:id/students/:studentID', (req, res) => {

    let course_ID = req.params.id;
    let studentID = req.params.studentID;

    Course.findOne({
        courseID: course_ID
    }, (err, course) => {

        if (err) {
            return res.status(500).json(dataFormatConverter.transformError("500", err.message));
        } // End of IF

        if (course) {

            console.log(course);
            let studentList = course.students;
            let index = studentList.indexOf(studentID);

            if (index > -1) {

                studentList.splice(index, 1);

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

                        course.name = course.name;
                        course.instructor = course.instructor;
                        course.location = course.location;
                        course.dayTime = course.dayTime;
                        course.enrollment = course.enrollment;
                        course.students = studentList;
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
            } else {
                return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request"));
            }
        } else {
            return res.status(404).send(dataFormatConverter.transformError("404", "Resource not found"));
        }

    });
});

router.put('/:id/students', (req, res) => {
    let course_ID = req.params.id;
    let newStudentList = req.body.data.students;

    if ((newStudentList) && !(newStudentList instanceof Array)) {
        return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request"));
    }

    if (req.body.courseID != course_ID) {
        return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request. The mentioned courseID is not matching the one specified in URI"));
    }

    Course.findOne({
        courseID: course_ID
    }, (err, course) => {

        if (err) {
            return res.status(500).json(dataFormatConverter.transformError("500", err.message));
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

                    course.name = course.name;
                    course.instructor = course.instructor;
                    course.location = course.location;
                    course.dayTime = course.dayTime;
                    course.enrollment = course.enrollment;
                    course.students = newStudentList;
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

        } else {
            return res.status(404).send(dataFormatConverter.transformError("404", "Resource not found"));
        }

    });


});

module.exports = router;
