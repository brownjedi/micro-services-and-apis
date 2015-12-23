'use strict';

const Consumer = require('sqs-consumer');
const util = require('./../utilities/util');
const request = require('superagent');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || require('./../config/awsCredentials.json').AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || require('./../config/awsCredentials.json').AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || require('./../config/awsCredentials.json').AWS_REGION || 'us-east-1'
});

let queueUrl = process.env.queueUrl || require('./../config/queueUrl.json').url;

let queue = Consumer.create({
    queueUrl: queueUrl,
    batchSize: 1,
    handleMessage: handleQueueMessage,
    sqs: new AWS.SQS()
});

queue.on('error', (err) => {
    console.log(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
});

function handleQueueMessage(message, done) {

}

function startPolling() {
    queue.start();
}

function stopPolling() {
    queue.stop();
}

module.exports.startPolling = startPolling;
module.exports.stopPolling = stopPolling;