'use strict';

// Module dependencies
const mongoose = require('mongoose');

let studentSchema = new mongoose.Schema({

	studentID : {type: String, required: true},
	name: {

		lastName:  {type: String, required: true},
		firstName:  {type: String, required: true}
	},
	degree: String,
	major: String,
	courses: {type: [String], default: []},
	version: {type: String, default: Date.now }	
});

let student = mongoose.model('student', studentSchema);

module.exports = student;

