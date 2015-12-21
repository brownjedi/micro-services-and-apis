'use strict';

const Consumer = require('sqs-consumer');
const util = require('./../utilities/util');
const request = require('superagent');

let queueUrl = process.env.queueUrl || require('./../config/queueUrl.json');
let queue = Consumer.create({
    queueUrl: queueUrl,
    handleMessage: handleQueueMessage
});

queue.on('error', handleQueueError);


function handleQueueMessage(message, done) {


}

function validateMessage(message) {

    //if(message.Body) {
    //    let data = message.Body;
    //    if(data.method )
    //
    //
    //        } else {
    //    done();
    //}

    return false;
}

function handleQueueError(err) {
    console.log(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
}

function startPolling() {
    queue.start();
}

module.exports.startPolling = startPolling;