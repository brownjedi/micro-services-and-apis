'use strict';

const mongoose = require('mongoose');

module.exports = function(schemaFilePath) {
    let schema;
    let model;
    let exports = {};

    function refreshModel() {
        let schemaJson = require(schemaFilePath);
        schema = new mongoose.Schema(schemaJson.schema, {
            timestamps: {
                createdAt: 'createdAt',
                updatedAt: 'updatedAt'
            }
        });

        model = mongoose.model(schemaJson.modelIdentifier, schema);
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
