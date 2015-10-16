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

module.exports.transformError = transformError;