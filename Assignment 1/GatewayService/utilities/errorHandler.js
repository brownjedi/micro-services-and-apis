module.exports = {
    getErrorJSON: function(status, message) {
        var errorJSON = {
            type: "error",
            errors: [
                    {
                        version: "v1",
                        status: status,
                        message: message
                    }
                ]
        };
        return errorJSON;
    }
};