'use strict';

// Module dependencies
const express = require('express');
const router = express.Router();
const Student = require('./../models/student');
const dataFormatConverter = require('./../utilities/converter');

//GET 

router.get('/:id',(req,res) => {
	let studentIDrequested= req.params.id;
	if(studentIDrequested) {
		Student.findOne({studentID: studentIDrequested}, (err, student) => {
			if(err) {
				return res.status(500).send(dataFormatConverter.transformError("500","Internal Server Error"));
			}
			if(!student) {	
				return res.status(404).send(dataFormatConverter.transformError("404","Resource not found"));
			}
			else {
				return res.status(200).json(dataFormatConverter.studentDBToJSON(student));
			}
		});
	}
	else {	
		return res.status(400).send(dataFormatConverter.transformError("400","Bad Request"));
	}
});

// 2 POST
router.post('/', (req, res) => {

	let data = req.body;
		if(data && data.studentID && data.name && data.name.firstName && data.name.lastName ) {

			if(data.courses && !(data.courses instanceof Array)){
				return res.status(400).send(dataFormatConverter.transformError("400","Bad Request"));
			}

			Student.findOne({studentID: data.studentID}, (err, student) => {
				if(err) {
					return res.status(500).send(dataFormatConverter.transformError("500","Internal Server Error"));
				}
				if(student)
				{
					return res.status(409).send(dataFormatConverter.transformError("409","Resource Conflict"));
				}
				else
				{
					let student = new Student({
					studentID: data.studentID,
					name: {
						firstName: data.name.firstName,
						lastName: data.name.lastName
					},
					degree: data.degree,
					major:  data.major,
					courses: data.courses,
					version: data.version
					});
					student.save((err, result) => {
					if(err) {
						return res.status(500).send(dataFormatConverter.transformError("500","Internal Server Error"));
					}
					else {
						return res.status(201).send(dataFormatConverter.studentDBToJSON(result));
					}
				});

				}
			});
		}
		else
		{
			return res.status(400).send(dataFormatConverter.transformError("400","Bad Request"));
		}
});

// 3. PUT
router.put('/:id', (req, res) => {

	let data = req.body;
	if((req.params.id == data.studentID) && data.studentID && data && data.name && data.name.firstName && data.name.lastName) {
		
		if(data.courses && !(data.courses instanceof Array)){
				return res.status(400).send(dataFormatConverter.transformError("400","Bad Request"));
		}

		Student.findOne({studentID: data.studentID}, (err, student) => {
			if(err) {
				return res.status(500).send(dataFormatConverter.transformError("500","Internal Server Error"));
			}
			if(!student) {	
				return res.status(404).send(dataFormatConverter.transformError("404","Resource not found"));
			}
			else {

				student.studentID = data.studentID;
				student.name.firstName = data.name.firstName;
				student.name.lastName = data.name.lastName;
				student.degree = data.degree;
				student.major = data.major;
				student.courses=data.courses;
				student.version=data.version;

				student.save((err, result) => {
					if(err) {
						return res.status(500).send(dataFormatConverter.transformError("500","Internal Server Error"));
					}
					else {
						return res.status(200).send(dataFormatConverter.studentDBToJSON(result));
					}
				});
			}
		});
	}
	else {
		return res.status(400).send(dataFormatConverter.transformError("400","Bad Request"));
	}
});

// 4. DELETE
router.delete('/:id', (req, res) => {
	let studentIDrequested = req.params.id;
	if(studentIDrequested) {
		Student.findOne({studentID: studentIDrequested}, (err, student) => {
			if(err) {
				return res.status(500).send(dataFormatConverter.transformError("500","Internal Server Error"));
			}
			if(student){
				student.remove();
				return res.status(204).send(dataFormatConverter.transformError("204","Successfully Deleted"));
			}
			else
			{
				return res.status(404).send(dataFormatConverter.transformError("404","Resource not found"));
			}
		});
	}
	else {
		return res.status(400).send(dataFormatConverter.transformError("400","Bad Request"));
	}
});

module.exports = router;

