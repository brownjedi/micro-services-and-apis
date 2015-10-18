'use strict';

// Module dependencies
const mongoose = require('mongoose');

let subscriptionSchema = new mongoose.Schema({
    subscriptionID: {
        type: Number
    },
    callback: {
        type: String,
        required: true
    },
    events: {
        type: [String],
        default: []
    }
});

let subscription = mongoose.model('subscription', subscriptionSchema);

module.exports = subscription;
