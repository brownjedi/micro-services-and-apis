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
        removeModel(schemaJson.collectionName);
        console.log('From Course Model', schemaJson);
        schema = new mongoose.Schema(schemaJson.schema, {
            timestamps: {
                createdAt: 'createdAt',
                updatedAt: 'updatedAt'
            },
            collection: schemaJson.collectionName
        });

        model = mongoose.model(schemaJson.collectionName, schema);
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
