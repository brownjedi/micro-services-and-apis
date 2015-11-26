'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const databaseService = require('./../services/databaseService');
const eventService = require('./../services/eventService');
const util = require('./../utilities/util');


router.get('/', (req, res) => {
    databaseService.find({}, (err, subscriptions) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        if (subscriptions) {
            util.generateSubscriptionJSON(subscriptions, (err, result) => {
                return res.status(200).sendData(result);
            });
        } else {
            return res.status(404).sendData(util.generateErrorJSON(404, 'The request resource is not found'));
        }
    });
});

router.get('/:id', (req, res) => {
    databaseService.findOneById(req.params.id, (err, subscription) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        if (subscription) {
            util.generateSubscriptionJSON(subscription, (err, result) => {
                return res.status(200).sendData(result);
            });
        } else {
            return res.status(404).sendData(util.generateErrorJSON(404, 'The request resource is not found'));
        }
    });
});

router.post('/:id', (req, res) => {
    async.waterfall([
        async.apply(databaseService.findOneById, req.params.id),
        function(data, callback) {
            if (!data) {
                let temp = undefined;
                if (req.body && req.body.data) {
                    temp = req.body.data;
                }
                databaseService.validateInput(req.params.id, temp, callback);
            } else {
                let err = new Error();
                err.status = 409;
                err.message = 'The request resource already exists';
                return callback(err);
            }
        },
        function(data, callback) {
            databaseService.addSubscription(data, callback);
        }
    ], (err, subscription) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        if (subscription) {
            util.generateSubscriptionJSON(subscription, (err, result) => {
                return res.status(200).sendData(result);
            });
        } else {
            return res.status(404).sendData(util.generateErrorJSON(404, 'The request resource is not found'));
        }
    });
});

router.put('/:id', (req, res) => {
    async.waterfall([
        async.apply(databaseService.findOneById, req.params.id),
        function(data, callback) {
            if (data) {
                let temp = undefined;
                if (req.body && req.body.data) {
                    temp = req.body.data;
                }
                databaseService.validateInput(req.params.id, temp, callback);
            } else {
                let err = new Error();
                err.status = 404;
                err.message = 'The request resource is not found';
                return callback(err);
            }
        },
        function(data, callback) {
            databaseService.updateSubscription(req.params.id, data, callback);
        }
    ], (err, subscription) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        if (subscription) {
            util.generateSubscriptionJSON(subscription, (err, result) => {
                return res.status(200).sendData(result);
            });
        } else {
            return res.status(404).sendData(util.generateErrorJSON(404, 'The request resource is not found'));
        }
    });
});

router.delete('/:id', (req, res) => {
    async.waterfall([
        async.apply(databaseService.findOneById, req.params.id),
        function(data, callback) {
            if (data) {
                databaseService.deleteSubscription(req.params.id, callback);
            } else {
                let err = new Error();
                err.status = 404;
                err.message = 'The request resource is not found';
                return callback(err);
            }
        }
    ], (err) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        return res.status(204).end();
    });
});

module.exports = router;
