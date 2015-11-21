'use strict';

function generateErrorJSON(status, message) {
    return {
        type: "error",
        errors: [{
            version: "v1",
            status: status,
            message: message
        }]
    };
}

function schemaErrorToHTTP(errorStatus) {
    let errorMap = {
        'SCHEMA_ERROR_RESOURCE_NOT_FOUND': 404,
        'SCHEMA_ERROR_INTERAL_ERROR': 500,
        'SCHEMA_ERROR_RESOURCE_CONFLICT': 409,
        'SCHEMA_ERROR_UNAUTHORIZED': 401,
        'SCHEMA_ERROR_VALIDATION_CHECK_FAILED': 400,
        'SCHEMA_ERROR_BAD_INPUT_REQUEST': 400,
        'SCHEMA_ERROR_FORBIDDEN': 403
    }

    return errorMap[errorStatus] || 500;
}

module.exports.generateErrorJSON = generateErrorJSON;
module.exports.schemaErrorToHTTP = schemaErrorToHTTP;
