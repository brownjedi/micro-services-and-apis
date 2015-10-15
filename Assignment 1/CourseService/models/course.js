'use strict';

// Module dependencies
const mongoose = require('mongoose');

let courseSchema = new mongoose.Schema({

});

let course = mongoose.model('course', courseSchema);

module.exports = course;

