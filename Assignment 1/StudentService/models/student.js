'use strict';

// Module dependencies
const mongoose = require('mongoose');

let studentSchema = new mongoose.Schema({

});

let student = mongoose.model('student', studentSchema);

module.exports = student;

