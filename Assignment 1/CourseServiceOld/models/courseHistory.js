'use strict';

const mongoose = require('mongoose');

let courseHistorySchema;
let courseHistory;

function getInstance() {
    if(!courseHistory) {
        refreshSchema();
    }
    return courseHistory;
}

function refreshSchema() {
	courseHistorySchema = new mongoose.Schema(require('./schema/courseSchema.json'));
	courseHistory = mongoose.model('courseHistory', courseHistorySchema);
}

module.exports.getInstance = getInstance;
module.exports.refreshSchema = refreshSchema;