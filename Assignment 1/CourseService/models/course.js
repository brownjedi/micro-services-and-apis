'use strict';

// Module dependencies
const mongoose = require('mongoose');
const sequence = require('./counter');
const schemaFilePath = './schema/courseSchema.json';
let courseMongooseSchema;
let course;
let schema;

function getInstance() {
    if (!course) {
        refreshSchema();
    }
    return course;
}

function getSchema() {
    if (!schema) {
        schema = require(schemaFilePath);
    }
    return schema;
}

function getSchemaFilePath () {
    return schemaFilePath;
}

function getMandatoryFields() {
    return ['courseID', 'name', 'createdAt', 'updatedAt', 'version'];
}

function getValidFieldTypes() {
    return ['String', 'Number', 'Date', 'Boolean'];
}

function refreshSchema() {
    // Define the Course Scheme
    schema = require(schemaFilePath);
    courseMongooseSchema = new mongoose.Schema(schema, {
        timestamps: {
            createdAt: 'createdAt',
            updatedAt: 'updatedAt'
        }
    });

    courseMongooseSchema.pre('save', function(next) {
        var doc = this;
        if (!doc.courseID) {
            sequence.nextSequenceNumber('courseID', function(err, seq) {
                if (err) throw err;
                doc.courseID = seq;
                next();
            });
        } else {
            next();
        }
    });

    course = mongoose.model('course', courseMongooseSchema);
}

module.exports.getInstance = getInstance;
module.exports.getSchemaFilePath = getSchemaFilePath;
module.exports.refreshSchema = refreshSchema;
module.exports.getSchema = getSchema;
