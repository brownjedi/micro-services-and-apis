'use strict';

const mongoose = require('mongoose');

module.exports = function(schemaFilePath) {
    let schema;
    let model;
    let exports = {};

    function removeModel(modelName) {
        delete mongoose.models[modelName];
        delete mongoose.modelSchemas[modelName];
    }

    function refreshModel() {
        // Doing this to remove the schema from require cache
        delete require.cache[require.resolve(schemaFilePath)];
        let schemaJson = require(schemaFilePath);

        removeModel(schemaJson.historyCollectionName);

        schema = new mongoose.Schema(schemaJson.schema, {
            collection: schemaJson.historyCollectionName
        });

        model = mongoose.model(schemaJson.historyCollectionName, schema);
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
}
