'use strict';

// Module dependencies
const mongoose = require('mongoose');

let urlMappingSchema = new mongoose.Schema({

});

let urlMapping = mongoose.model('urlMappingSchema', urlMappingSchema);

module.exports = urlMapping;

