'use strict';

// Module dependencies
const mongoose = require('mongoose');
const sequence = require('./counter');

let subscriptionSchema = new mongoose.Schema({
    subscriptionID: {
        type: String
    },
    callback: {
        type: String,
        required: true
    },
    events: {
        type: [String],
        default: []
    }
}, {
	timestamps: true
});

subscriptionSchema.pre('save', function (next) {
	let doc = this;
	if(!doc.subscriptionID) {
		// This is to ensure that the subscriptionID doesn't increment in case of a PUT. (In PUT the subscriptionID already exists)
		sequence.nextSequenceNumber('subscriptionID', function (err, seq) {
			if(err) throw err;
			doc.subscriptionID = `SID${seq}`;
			next();
		});
	} else {
		next();
	}
});

let subscription = mongoose.model('subscription', subscriptionSchema);

module.exports = subscription;