"use strict";

// Module dependencies
const mongoose = require('mongoose');

let urlMappingSchema = new mongoose.Schema({
	mapping_id: { type: Number, required: true, unique: true },
	publishedURL : { type: String, unique: true, required: true },
	privateURL : { type: String, required: true }
});

let urlMappingCollection = mongoose.model('urlMapping', urlMappingSchema);

module.exports = { urlMappingCollection, urlMappingSchema };

