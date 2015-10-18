'use strict';

// Module dependencies
var mongoose = require('mongoose');

var studentSchema = new mongoose.Schema({

});

var student = mongoose.model('student', studentSchema);

module.exports = student;

