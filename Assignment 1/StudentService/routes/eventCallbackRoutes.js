'use strict';

// Module dependencies
const express = require('express');
const router = express.Router();
const Student = require('./../models/student');

// Ask whether to add/delete the course through studentRoutes.js

router.post('/', (req, res) => {
	let Students = req.body.data.students;
	
	if(Students && !(Students instanceOf Array)) {
		// return an error obejct
	}

	Students.forEach((student) => {
		Student.findOne({studentID: student}, (err, student) => {

			if(err) {
				// Return status code of Error here!!
			}

			if(!student) {
				return {			// mention the Meril's URL
					"type": "COURSE_ADDED",
					"version": 	// Need to confirm
					"data": {
						"courseID": req.body.data.courseID,
						"students": req.body.data.students
					} // End of Data
				}  // End of return
			}  // End of if
			else {
				// return an error object
				return {			// mention the Meril's URL (res.send())
					"type": "COURSE_ADDED_ERROR",
					"version": 	// Need to confirm
					"data": {
						"courseID": req.body.data.courseID,
						"students": req.body.data.students
					} // End of data
				} // End of return
			} // End of else
		}); // End of findOne

	}); // End of forEach
}

router.delete('', (req, res) => {
	let Students = req.body.data.students;

	if(Students && !(Students instanceOf Array)) {
		// return an error obejct
	}

	Student.forEach((student) => {
		Student.findOne({studentID: student}, (err, student) => {
			if(err) {
				// Query Error (Send ERROR CODE);
			}

			if(!student) {
				return {			// mention the Meril's URL (res.send())
					"type": "COURSE_DELETED_ERROR",
					"version": 	// Need to confirm
					"data": {
						"courseID": req.body.data.courseID,
						"students": req.body.data.students
					} // End of data
				} // End of return
			}
			else {
				return {			// mention the Meril's URL (res.send())
					"type": "COURSE_DELETED",
					"version": 	// Need to confirm
					"data": {
						"courseID": req.body.data.courseID,
						"students": req.body.data.students
					} // End of data
				} // End of return
			}
		});
	});

});

module.exports = router;

