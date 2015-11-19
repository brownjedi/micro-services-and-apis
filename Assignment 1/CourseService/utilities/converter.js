'use strict';

const Course = require('./../models/course');

function transformError(status, message) {
    return {
        type: "error",
        errors: [{
            version: "v1",
            status: status,
            message: message
        }]
    };
}

function transformSchema(schema, name) {
    let output = {
        type: "schema"
    };
    if (name) {
        output.fieldName = name;
    }
    output.schema = schema;
    return output;
}

function courseJSONToDB(result) {
    let output = {};
    let schema = Course.getSchema();

    for (let key in Course.getSchema()) {
        if (result.hasOwnProperty(key)) {
            output[key] = result[key];
        }
    }
    return output;
}

function courseDBToJSON(results) {
    let data = {};

    if (results instanceof Array) {

        data = {
            type: "courses",
            "courses": []
        }

        results.forEach((result) => {
            data.courses.push(generateCourse(result));
        });
    } else {
        data = generateCourse(results);
    }

    function generateCourse(course) {
        if (course) {
            let output = {
                type: "course",
                courseID: course.courseID,
                data: {
                    link: {
                        rel: "self",
                        href: `/api/v1/courses/${course.courseID}`
                    }
                }
            };

            for (let key in Course.getSchema()) {
                if (course.hasOwnProperty(key)) {
                    if (key !== 'courseID') {
                        output.data[property] = course[property];
                    }
                }
            }

            return output;
        } else {
            return {};
        }
    }
    return data;
}

function eventGenerator(type, courseID, studentID, version) {
    return {
        "type": type,
        "data": {
            "courseID": courseID,
            "studentID": studentID
        },
        "version": version
    };
}

// This is done so make the function call visible externally
module.exports.transformError = transformError;
module.exports.transformSchema = transformSchema;
module.exports.courseDBToJSON = courseDBToJSON;
module.exports.courseJSONToDB = courseJSONToDB;
module.exports.eventGenerator = eventGenerator;
