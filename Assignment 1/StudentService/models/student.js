'use strict';

// Module dependencies
const mongoose = require('mongoose');
const sequence = require('./counter');

let studentSchema = new mongoose.Schema({
    studentID: {
        type: String
    },
    name: {
        lastName: {
            type: String,
            required: true
        },
        firstName: {
            type: String,
            required: true
        }
    },
    degree: String,
    major: String,
    courses: {
        type: [String],
        default: []
    },
    version: {
        type: String,
        required: true
    },
    createdAt: Date,
    updatedAt: Date
}, {
    timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}
});

studentSchema.pre('save', function(next) {
    let doc = this;
    if(!doc.studentID) {
        sequence.nextSequenceNumber('studentID', function(err, seq) {
            if (err) throw err;
            doc.studentID = `${doc.name.firstName.slice(0,1)}${doc.name.lastName.slice(0,1)}${seq}`;
            next();
        });
    } else {
        next();
    }
});

let student = mongoose.model('student', studentSchema);

module.exports = student;
