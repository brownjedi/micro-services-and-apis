'use strict';

const dynamoose = require('dynamoose');

module.exports = function (schemaFilePath) {
    let schema;
    let model;
    let exports = {};

    function removeModel(modelName) {
        delete dynamoose.models[modelName];
    }

    function refreshModel() {
        // Doing this to remove the schema from require cache
        delete require.cache[require.resolve(schemaFilePath)];
        let schemaJson = require(schemaFilePath);

        removeModel(schemaJson.collectionName);

        schema = new dynamoose.Schema(processSchemaJSON(schemaJson.schema));
        model = dynamoose.model(schemaJson.collectionName, schema);
    }

    function processSchemaJSON(schemaJSON) {
        let temp = JSON.parse(JSON.stringify(schemaJSON));

        for (var key in schemaJSON) {
            if (schemaJSON.hasOwnProperty(key)) {
                if(temp[key].type && temp[key].type.constructor === Array && temp[key].type.length > 0) {
                    let type = temp[key].type[0];
                    if(type === 'String') {
                        temp[key].type = [String];
                    } else if(type === 'Number') {
                        temp[key].type = [Number];
                    } else if(type === 'Date') {
                        temp[key].type = [Date];
                    } else if(type === 'Boolean') {
                        temp[key].type = [Boolean];
                    }
                }
            }
        }

        return temp;
    }

    function getModel() {
        if (!model) {
            refreshModel();
        }
        return model;
    }

    exports.refreshModel = refreshModel;
    exports.getModel = getModel;

    return exports;
};
