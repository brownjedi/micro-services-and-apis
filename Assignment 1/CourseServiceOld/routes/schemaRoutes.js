'use strict';

const express = require('express');
const fs = require('fs');
const router = express.Router();
const Course = require('./../models/course');
const CourseHistory = require('./../models/courseHistory');
const dataFormatConverter = require('./../utilities/converter');

router.get('/fields', (req, res) => {
    res.status(200).json(dataFormatConverter.transformSchema(Course.getSchema()));
});

router.get('/fields/:name', (req, res) => {
    let schema = Course.getSchema();
    let field = schema[req.params.name];

    if (field) {
        res.status(200).json(dataFormatConverter.transformSchema(field, req.params.name));
    } else {
        res.status(404).json(dataFormatConverter.transformError("404", "Field not found"));
    }
});

router.delete('/fields/:name', (req, res) => {

	if(Course.getMandatoryFields().indexOf(req.params.name) > -1) {
		return res.status(403).json(dataFormatConverter.transformError("403", "Cannot delete/Modify a Mandatory Field"));
	}

    let schema = Course.getSchema();
    let field = schema[req.params.name];

    if (field) {
        delete schema[req.params.name];
        fs.writeFile(Course.getSchemaFilePath(), JSON.stringify(schema), (err) => {
            if (err) {
                return res.status(500).json(dataFormatConverter.transformError("500", err.message));
            }
            Course.refreshSchema();
            CourseHistory.refreshSchema();
            return res.status(204).end();
        });
    } else {
        return res.status(404).json(dataFormatConverter.transformError("404", "Field not found"));
    }
});

router.put('/fields/:name', (req, res) => {

	if(Course.getMandatoryFields().indexOf(req.params.name) > -1) {
		return res.status(403).json(dataFormatConverter.transformError("403", "Cannot delete/Modify a Mandatory Field"));
	}

    let schema = Course.getSchema();
    if (schema[req.params.name]) {

        fs.writeFile(Course.getSchemaFilePath(), JSON.stringify(schema), (err) => {
            if (err) {
                return res.status(500).json(dataFormatConverter.transformError("500", err.message));
            }
            Course.refreshSchema();
            CourseHistory.refreshSchema();
            return res.status(204).end();
        });
    } else {
        return res.status(404).json(dataFormatConverter.transformError("404", "Field not found"));
    }
});

router.post('/fields', (req, res) => {
});


module.exports = router;
