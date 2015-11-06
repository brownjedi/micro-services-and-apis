'use strict';

const mongoose = require('mongoose');

let courseHistorySchema = new mongoose.Schema({
    courseID: Number,
    name: {
        type: String,
        required: true
    },
    instructor: String,
    location: String,
    dayTime: String,
    createdAt: Date,
    updatedAt: Date,
    enrollment: {
        current: Number,
        max: Number
    },
    students: {
        type: [String],
        default: []
    },
    version: {
        type: String,
        required: true
    }
});

let courseHistory = mongoose.model('courseHistory', courseHistorySchema);

module.exports = courseHistory;
