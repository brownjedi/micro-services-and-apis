// 'use strict';

// // Module dependencies
// const express = require('express');
// const router = express.Router();
// const Student = require('./../models/student');

// // Ask whether to add/delete the course through studentRoutes.js

// router.post('/students/:studentID/courses/:courses', (req, res) => {

// 	let student_ID = req.params.studentID;
// 	let courses = req.params.courses;

// 	if((courses) && !(courses instanceOf Array)) {
// 		// return error object
// 	}

// 	Student.findOne({studentID: student_ID}, (err, student) => {

// 		if(err) {
// 		// Return status code of Error here!!
// 		}

// 		if(student) {
// 			return {			// mention the Meril's URL
// 				"type": "COURSE_ADDED",
// 				"version": 	// Need to confirm
// 				"data": {
// 					"courses": courses,
// 					"studentID": student_ID
// 				} // End of Data
// 			}  // End of return
// 		}  // End of if
// 		else {
// 			// return an error object
// 			return {			// mention the Meril's URL (res.send())
// 				"type": "COURSE_ADDED_ERROR",
// 				"version": 	// Need to confirm
// 				"data": {
// 					"courses": courses,
// 					"studentID": student_ID
// 				} // End of data
// 			} // End of return
// 		} // End of else
// 	}); // End of findOne
// });

// router.delete('/students/:studentID/courses/:courses', (req, res) => {
// 	let student_ID = req.params.studentID;
// 	let courses = req.params.courses;

// 	if(courses && !(courses instanceOf Array)) {
// 		// return an error obejct
// 	}

// 	Student.findOne({studentID: student_ID}, (err, student) => {
// 		if(err) {
// 			// Query Error (Send ERROR CODE);
// 		}

// 		if(student) {
// 			// Now delete the student from the list of courses (Iterate through the list of courses)
// 			courses.forEach((course) => {
// 				if()
// 			});

// 			return {			// mention the Meril's URL (res.send())
// 				"type": "COURSE_DELETED",
// 				"version": 	// Need to confirm
// 				"data": {
// 					"courses": courses,
// 					"studentID": student_ID
// 				} // End of data
// 			} // End of return
// 		}
// 		else {
// 			return {			// mention the Meril's URL (res.send())
// 				"type": "COURSE_DELETED_ERROR",
// 				"version": 	// Need to confirm
// 				"data": {
// 					"courseID": courses,
// 					"students": student_ID
// 				} // End of data
// 			} // End of return
// 		}
// 	});

// });

// module.exports = router;

