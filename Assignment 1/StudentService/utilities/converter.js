'use strict';

function transformError(status, message) {
	return {
		type: "err",
		errors: [{
			version: "v1",
			status: status,
			message: message
		}]
	}
}

function studentDBToJSON(results) {
	// convert to mentioned schema as per TLDS

	let data = {
		type: "student",
		"students": []
	}

	if(results instanceof Array){
		results.forEach((result) => {
			data.students.push(generateStudent(result));
		})
	} else {
		data.students.push(generateStudent(results));
	}

	function generateStudent (student) {
		if(student) {
			return {
				studentID: student.studentID,
				data: {
					name: {
						lastName: student.name.lastName,
						firstName: student.name.firstName
					},
					degree: student.degree,
					major: student.major,
					courses: student.courses,
					version: student.version,
					link: {
						rel: "self",
						href: `/api/v1/students/${student.studentID}`
					}
				}
			};	
		} else {
			return {};
		}
	}
	return data;
}

module.exports.transformError = transformError;
module.exports.studentDBToJSON	 = studentDBToJSON; 