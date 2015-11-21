'use strict';

const mongoose = require('mongoose');

module.exports = function(schemaFilePath) {
    let schema;
    let model;
    let exports = {};

    function refreshModel() {
        let schemaJson = require(schemaFilePath);
        schema = new mongoose.Schema(schemaJson.schema);
        model = mongoose.model(schemaJson.modelHistoryIdentifier, schema);
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