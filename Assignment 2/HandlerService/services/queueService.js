'use strict';

const Consumer = require('sqs-consumer');
const util = require('./../utilities/util');
const request = require('superagent');
const AWS = require('aws-sdk');
const os = require('os');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || require('./../config/awsCredentials.json').AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || require('./../config/awsCredentials.json').AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || require('./../config/awsCredentials.json').AWS_REGION || 'us-east-1'
});

let queueUrl = process.env.queueUrl || require('./../config/queueUrl.json').url;
let sqsClient = new AWS.SQS();

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

    let data = JSON.parse(message.Body);
    let port = process.env.PORT || process.env.VCAP_APP_PORT || 3000;
    let url = 'http://' + os.hostname() + ':' + port + '/api/v1/urlRouting' + '/' + util.removeAdditionalSlashes(data.url);
    let internalRequest = request(data.method, url);

    if (data.headers) {
        internalRequest.set(data.headers);
    }

    if (data.body && Object.keys(data.body).length > 0) {
        internalRequest.send(data.body);
    }

    internalRequest.end((error, response) => {

        if (error) {
            console.log(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        } else {
            let output = {};
            output.MessageId = message.MessageId;
            output.body = response.body;

            if (output.body.link) {
                output.body.link.href = data.url;
            }

            var messageJSON = JSON.stringify(output);
            var params = {
                MessageBody: messageJSON,
                QueueUrl: data.outputQueueUrl,
                DelaySeconds: 0
            };

            sqsClient.sendMessage(params, (err, result) => {
                if(err) {
                    console.log(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
                }
            });
        }

        return done();
    });
}

function startPolling() {
    queue.start();
}

function stopPolling() {
    queue.stop();
}

module.exports.startPolling = startPolling;
module.exports.stopPolling = stopPolling;