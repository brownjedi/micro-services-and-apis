'use strict';

const util = require('./../utilities/util');
const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || require('./../config/awsCredentials.json').AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || require('./../config/awsCredentials.json').AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || require('./../config/awsCredentials.json').AWS_REGION || 'us-east-1'
});

let sqsProducer = new AWS.SQS();

function validateInput(message, callback) {

    if(message) {

        if(!message.method || ['GET', 'PUT', 'POST', 'DELETE'].indexOf(message.method) <= -1) {
            let err = new Error();
            err.status = 'QUEUE_ERROR_BAD_INPUT_REQUEST';
            err.message = "Bad Request. The 'method' is a required field which can contain only 'GET', 'PUT', 'POST', 'DELETE' values";
            return callback(err);
        }

        if(!message.url) {
            let err = new Error();
            err.status = 'QUEUE_ERROR_BAD_INPUT_REQUEST';
            err.message = "Bad Request. The 'url' is a required field";
            return callback(err);
        }

        if(!message.outputQueueUrl) {
            let err = new Error();
            err.status = 'QUEUE_ERROR_BAD_INPUT_REQUEST';
            err.message = "Bad Request. The 'outputQueueUrl' is a required field";
            return callback(err);
        }

        if(['PUT', 'POST'].indexOf(message.method) > -1 && !message.body) {
            let err = new Error();
            err.status = 'QUEUE_ERROR_BAD_INPUT_REQUEST';
            err.message = "Bad Request. The 'body' must be specified when the method is 'PUT' or 'POST'";
            return callback(err);
        }


        return callback(null, message);

    } else {
        let err = new Error();
        err.status = 'QUEUE_ERROR_BAD_INPUT_REQUEST';
        err.message = 'Bad Request. The request needs a body';
        return callback(err);
    }
}

function addMessageToQueue(message, queueUrl, callback) {

    //Convert the object into string to send to queue
    var messageJSON = JSON.stringify(message);
    var params = {
        MessageBody: messageJSON,
        QueueUrl: queueUrl,
        DelaySeconds: 0
    };

    sqsProducer.sendMessage(params, callback);
}

module.exports.validateInput = validateInput;
module.exports.addMessageToQueue = addMessageToQueue;