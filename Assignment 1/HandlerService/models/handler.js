'use strict';

// Module dependencies
var mongoose = require('mongoose');

var handlerSchema = new mongoose.Schema({
	httpMethod: String,
	templateUrl: String,
	identifier: String, 
	regex: String,
	targetUrl: String
});

var handler = mongoose.model('handler', handlerSchema);

module.exports = handler;