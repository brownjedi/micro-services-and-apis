'use strict';

// Module dependencies
const mongoose = require('mongoose');
const sequence = require('./counter');

// Define the Course Scheme
let courseSchema = new mongoose.Schema({
    courseID: Number,
    name: {
        type: String,
        required: true
    },
    instructor: String,
    location: Number,
    dayTime: String,
    createdAt: Date,
    updatedAt: Date,
    enrollment: {
        current: Number,
        max: Number
    },
    students: {
        type: String
    },
    version: {
        type: String,
        default: Date.now
    }
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

courseSchema.pre('save', function (next) {
    var doc = this;
    if(!doc.courseID) {
        sequence.nextSequenceNumber('courseID', function (err, seq) {
            if (err) throw err;
            doc.courseID = seq;
            next();
        });
    } else {
        next();
    }
});

let course = mongoose.model('course', courseSchema);

module.exports = course;
