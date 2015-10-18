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

function studentDBToJSON(result) {
	// convert to mentioned schema as per TLDS
	return {
			type: "student",
			"students": [
			{
				studentID: result.studentID,
				data: {
					studentID:result.studentID,
					name: {
						lastName: result.name.lastName,
						firstName: result.name.firstName
					},
					degree: result.degree,
					major: result.major,
					courses: result.courses,
					version: result.version
				}
			}
		]
	}
}

module.exports.transformError = transformError;
module.exports.studentDBToJSON	 = studentDBToJSON; 