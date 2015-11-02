'use strict';

const mongoose = require('mongoose');

let studentHistorySchema = new mongoose.Schema({
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
});

let studentHistory = mongoose.model('studentHistory', studentHistorySchema);

module.exports = studentHistory;