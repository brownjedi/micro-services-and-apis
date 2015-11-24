'use strict';

// Module dependencies
const express = require('express');
const router = express.Router();
const Student = require('./../models/student');
const StudentHistory = require('./../models/studentHistory');
const dataFormatConverter = require('./../utilities/converter');

//GET *
router.get('/', (req, res) => {
    Student.find({}, (err, students) => {
        if (err) {
            return res.status(500).json(dataFormatConverter.transformError("500", err.message));
        }
        return res.status(200).json(dataFormatConverter.studentDBToJSON(students));
    });
});

// *
router.get('/:id', (req, res) => {
    Student.findOne({
        studentID: req.params.id
    }, (err, student) => {
    	console.log(student);
        if (err) {
            return res.status(500).json(dataFormatConverter.transformError("500", err.message));
        }
        if (!student) {
            return res.status(404).json(dataFormatConverter.transformError("404", "Resource not found"));
        } else {
            return res.status(200).json(dataFormatConverter.studentDBToJSON(student));
        }
    });
});

// 2 POST
router.post('/', (req, res) => {

    let data = req.body;
    if (data && data.name && data.name.firstName && data.name.lastName) {

        if (data.courses && !(data.courses instanceof Array)) {
            return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request. The courses field should be an array."));
        }

        let student = new Student({
            name: {
                firstName: data.name.firstName,
                lastName: data.name.lastName
            },
            degree: data.degree,
            major: data.major,
            courses: data.courses,
            version: Date.now()
        });
        student.save((err, result) => {
            if (err) {
                return res.status(500).json(dataFormatConverter.transformError("500", err.message));
            } else {
                return res.status(201).json(dataFormatConverter.studentDBToJSON(result));
            }
        });

    } else {
        return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request. The firstName and lastName needs to be specified as a path parameter"));
    }
});

// 3. PUT
router.put('/:id', (req, res) => {

    let data = req.body;
    if (data && data.name && data.name.firstName && data.name.lastName) {

        if (data.courses && !(data.courses instanceof Array)) {
            return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request. The courses field should be an array."));
        }

        Student.findOne({
            studentID: req.params.id
        }, (err, student) => {
            if (err) {
                return res.status(500).json(dataFormatConverter.transformError("500", err.message));
            }
            if (!student) {
                return res.status(404).json(dataFormatConverter.transformError("404", "Resource not found"));
            } else {

            	let studentHistory = new StudentHistory({
            		studentID: student.studentID,
					name: {
					    firstName: student.name.firstName,
					    lastName: student.name.lastName
					},
					degree: student.degree,
					major: student.major,
					courses: student.courses,
					version: student.version,
					createdAt: student.createdAt,
					updatedAt: student.updatedAt
            	});

            	studentHistory.save((err) => {
        		 	if (err) {
                        return res.status(500).json(dataFormatConverter.transformError("500", err.message));
                    } else {                                  
						student.name.firstName = data.name.firstName;
						student.name.lastName = data.name.lastName;
						student.degree = data.degree;
						student.major = data.major;
						student.courses = data.courses;
						student.version = Date.now();

						student.save((err, result) => {
						    if (err) {
						        return res.status(500).json(dataFormatConverter.transformError("500", err.message));
						    } else {
						        return res.status(200).json(dataFormatConverter.studentDBToJSON(result));
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
    Student.findOne({
        studentID: req.params.id
    }, (err, student) => {
        if (err) {
            return res.status(500).send(dataFormatConverter.transformError("500", err.message));
        }
        if (student) {

            	let studentHistory = new StudentHistory({
            		studentID: student.studentID,
					name: {
					    firstName: student.name.firstName,
					    lastName: student.name.lastName
					},
					degree: student.degree,
					major: student.major,
					courses: student.courses,
					version: student.version,
					createdAt: student.createdAt,
					updatedAt: student.updatedAt
            	});

            	studentHistory.save((err) => {
        		 	if (err) {
                        return res.status(500).json(dataFormatConverter.transformError("500", err.message));
                    } else {                                  
			            student.remove(function (err) {
			            	if(err) {
				                return res.status(500).send(dataFormatConverter.transformError("500", err.message));
			            	} 
			                return res.status(204).send(dataFormatConverter.transformError("204", "Student successfully deleted"));
			            });
                    }
            	});
        } else {
            return res.status(404).send(dataFormatConverter.transformError("404", "Resource not found"));
        }
    });
});

router.get('/:id/courses', (req, res) => {
    let student_ID = req.params.id;
    //console.log(student_ID);
    //console.log("courseList is: " + courseList);

    // if((courseList) && !(courseList instanceof Array)) {
    //     return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request. The courses field should be an array."));
    // }

    Student.findOne({studentID: student_ID}, (err, student) => {
        if(err) {
            return res.status(500).send(dataFormatConverter.transformError("500", err.message));
        }

        if(student) {
            student.name.firstName = student.name.firstName;
            student.name.lastName = student.name.lastName;
            student.degree = student.degree;
            student.major = student.major;
            student.courses = student.courses;
            student.version = Date.now();
            return res.status(200).json(dataFormatConverter.studentDBToJSON(student));
        }

        else {
            return res.status(404).json(dataFormatConverter.transformError("404", "Resource not found"));
        }

    });

});

router.delete('/:id/courses/:courseID', (req, res) => {
    let student_ID = req.params.id;
    let courseID = req.params.courseID;

    Student.findOne({studentID: student_ID}, (err, student) => {
        if(err) {
            return res.status(500).send(dataFormatConverter.transformError("500", err.message));
        }

        if(student) {
            let courseList = student.courses;
            let index = courseList.indexOf(courseID);
            if (index > -1) {
                courseList.splice(index, 1);
                
                let studentHistory = new StudentHistory({
                    studentID: student.studentID,
                    name: {
                        firstName: student.name.firstName,
                        lastName: student.name.lastName
                    },
                    degree: student.degree,
                    major: student.major,
                    courses: student.courses,
                    version: student.version,
                    createdAt: student.createdAt,
                    updatedAt: student.updatedAt
                });

                studentHistory.save((err) => {
                    if (err) {
                        return res.status(500).json(dataFormatConverter.transformError("500", err.message));
                    } else {                                  
                        student.name.firstName = student.name.firstName;
                        student.name.lastName = student.name.lastName;
                        student.degree = student.degree;
                        student.major = student.major;
                        student.courses = courseList;
                        student.version = Date.now();

                        student.save((err, result) => {
                            if (err) {
                                return res.status(500).json(dataFormatConverter.transformError("500", err.message));
                            } else {
                                return res.status(200).json(dataFormatConverter.studentDBToJSON(result));
                            }
                        });
                    }
                });


            }
            else {
                return res.status(404).json(dataFormatConverter.transformError("404", "Resource not found"));
            }
        }

        else {
            return res.status(404).json(dataFormatConverter.transformError("404", "Resource not found"));
        }

    });

});

router.put('/:id/courses', (req, res) => {
    let student_ID = req.params.id;
    let newCourseList = req.body.data.courses;

    if((newCourseList) && !(newCourseList instanceof Array)) {
        return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request. The courses field should be an array."));
    }

    if(req.body.studentID != student_ID) {
        return res.status(400).json(dataFormatConverter.transformError("400", "Bad Request. The mentioned studentID does not match the URI"));   
    }

    Student.findOne({studentID: student_ID}, (err, student) => {
        if(err) {
            return res.status(500).send(dataFormatConverter.transformError("500", err.message));
        }

        if(student) {
            let studentHistory = new StudentHistory({
                    studentID: student.studentID,
                    name: {
                        firstName: student.name.firstName,
                        lastName: student.name.lastName
                    },
                    degree: student.degree,
                    major: student.major,
                    courses: student.courses,
                    version: student.version,
                    createdAt: student.createdAt,
                    updatedAt: student.updatedAt
                });

                studentHistory.save((err) => {
                    if (err) {
                        return res.status(500).json(dataFormatConverter.transformError("500", err.message));
                    } else {                                  
                        student.name.firstName = student.name.firstName;
                        student.name.lastName = student.name.lastName;
                        student.degree = student.degree;
                        student.major = student.major;
                        student.courses = newCourseList;
                        student.version = Date.now();

                        student.save((err, result) => {
                            if (err) {
                                return res.status(500).json(dataFormatConverter.transformError("500", err.message));
                            } else {
                                return res.status(200).json(dataFormatConverter.studentDBToJSON(result));
                            }
                        });
                    }
                });

        }

        else {
            return res.status(404).json(dataFormatConverter.transformError("404", "Resource not found"));
        }
    });

});



module.exports = router;
