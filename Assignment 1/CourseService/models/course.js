'use strict';

// Module dependencies
const mongoose = require('mongoose');
const sequence = require('./counter');

// Define the Course Scheme
let courseSchema = new mongoose.Schema(require('./schema/courseSchema.json'), {
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
