'use strict';

const mongoose = require('mongoose');

let courseHistorySchema = new mongoose.Schema(require('./schema/courseSchema.json'));
let courseHistory = mongoose.model('courseHistory', courseHistorySchema);

module.exports = courseHistory;
