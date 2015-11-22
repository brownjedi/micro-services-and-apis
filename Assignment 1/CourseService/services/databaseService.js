'use strict';

const schemaService = require('./schemaService');
const Course = schemaService.Course;
const CourseHistory = schemaService.CourseHistory;

function findOne(query, callback) {
    Course.getModel().findOne(query, callback);
}

function findOneById(id, callback) {
    Course.getModel().findOne({
        courseID: id
    }, callback);
}

function find(query, callback) {
    Course.getModel().find(query, callback);
}

function addCourse(data, callback) {

}

function deleteCourse(id, callback) {
    Course.getModel().remove({
        courseID: id
    }, callback);
}

function updateCourse(id, data, callback) {

}

function validateInput() {

}

function revertFromHistory(id, callback) {

}

function saveHistory(data, callback) {
    schemaService.getSchema((err, schemaJson) => {
    	let temp = {};
        for (var key in schemaJson.schema) {
            if (schemaJson.schema.hasOwnProperty(key)) {
            	temp[key] = data[key];
            }
        }

        let courseHistory = new CourseHistory.getModel()(temp);
        courseHistory.save(callback);
    });
}

module.exports.findOne = findOne;
module.exports.findOneById = findOneById;
module.exports.find = find;
module.exports.addCourse = addCourse;
module.exports.deleteCourse = deleteCourse;
module.exports.validateInput = validateInput;
module.exports.revertFromHistory = revertFromHistory;
module.exports.saveHistory = saveHistory;
