'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const databaseService = require('./../services/databaseService');
const util = require('./../utilities/util');


router.get('/', (req, res) => {
    databaseService.find({}, (err, k12Array) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        if (k12Array) {
            util.generateK12JSON(k12Array, (err, result) => {
                return res.status(200).sendData(result);
            });
        } else {
            return res.status(404).sendData(util.generateErrorJSON(404, 'The request resource is not found'));
        }
    });
});

router.get('/:id', (req, res) => {
    databaseService.findOneById(req.params.id, (err, k12Obj) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        if (k12Obj) {
            util.generateK12JSON(k12Obj, (err, result) => {
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
            databaseService.addK12Object(data, callback);
        }
    ], (err, k12Obj) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        if (k12Obj) {
            util.generateK12JSON(k12Obj, (err, result) => {
                return res.status(200).sendData(result);
            });
            // We need to Emit Event Here
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
            databaseService.updateK12Object(req.params.id, data, callback);
        }
    ], (err, k12Obj) => {
        if (err) {
            return res.status(util.customErrorToHTTP(err.status)).sendData(util.generateErrorJSON(util.customErrorToHTTP(err.status), err.message));
        }
        if (k12Obj) {
            util.generateK12JSON(k12Obj, (err, result) => {
                return res.status(200).sendData(result);
            });
            // We need to Emit Event Here
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
                databaseService.deleteK12Object(req.params.id, callback);
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
        // We need to Emit Event Here
    });
});

module.exports = router;
