'use strict';

// Module dependencies
const mongoose = require('mongoose');

let subscriptionSchema = new mongoose.Schema({
     
});

let subscription = mongoose.model('subscription', subscriptionSchema);

module.exports = subscription;

