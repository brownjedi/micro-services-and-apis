'use strict';

const mongoose = require('mongoose');

let counterSchema = new mongoose.Schema({
    _id: {
        type: String,
        unique: true
    },
    seq: {
        type: Number,
        default: 1000
    }
});

let Counter = mongoose.model('counter', counterSchema);

function nextSequenceNumber(name, callback) {
    Counter.findById(name, (err, data) => {
        if(err){
        callback(err);
        }
        else if (!data) {
            let counter = new Counter({
                _id: name
            })

            counter.save((err, result) => {
                callback(err, result.seq);
            });
        } else {
            Counter.findByIdAndUpdate(data._id, {
                $inc: {
                    seq: 1
                }
            }, {
            new: true
            }, (err, result) => {
            callback(err, result.seq);
            });
        }
    });
}

module.exports.nextSequenceNumber = nextSequenceNumber;