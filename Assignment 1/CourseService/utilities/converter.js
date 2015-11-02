'use strict';


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

function courseDBToJSON(results) { // Need to ask (Syntax)
    // convert to standard format as mentioned in TLDS
    let data = {
        type: "course",
        "courses": []
    }

    if (results instanceof Array) {
        results.forEach((result) => {
            data.courses.push(generateCourse(result));
        });
    } else {
        data.courses.push(generateCourse(results));
    }

    function generateCourse(course) {
        if (course) {
            return {
                courseID: course.courseID,
                data: {
                    name: course.name,
                    instructor: course.instructor,
                    location: course.location,
                    dayTime: course.dayTime,
                    enrollment: course.enrollment,
                    students: course.students,
                    version: course.version,
                    link: {
                        rel: "self",
                        href: `/api/v1/courses/${course.courseID}`
                    }
                }
            };
        } else {
            return {};
        }
    }
    return data;
}

// This is done so make the function call visible externally
module.exports.transformError = transformError;
module.exports.courseDBToJSON = courseDBToJSON;
