'use strict';

const express = require('express');
const router = express.Router();
const async = require('async');
const databaseService = require('./../services/databaseService');
const eventService = require('./../services/eventService');
const util = require('./../utilities/util');


router.get('/', (req, res) => {
    databaseService.find({}, (err, courses) => {
        if (err) {
            return res.status(500).json(util.generateErrorJSON(500, err.message));
        }
        if (courses) {
            return res.status(200).json(courses);
        } else {
            return res.status(404).json(util.generateErrorJSON(404, 'The request resource is not found'));
        }
    });
});

router.get('/:id', (req, res) => {
    databaseService.findOneById(req.params.id, (err, course) => {
        if (err) {
            return res.status(500).json(util.generateErrorJSON(500, err.message));
        }
        if (course) {
            return res.status(200).json(course);
        } else {
            return res.status(404).json(util.generateErrorJSON(404, 'The request resource is not found'));
        }
    });
});

router.post('/:id', (req, res) => {
    async.waterfall([
        async.apply(databaseService.findOneById, req.params.id),
        util.resourceDoesNotExists,
        function(data, callback) {
            databaseService.validateInput(req.body, callback);
        },
        function(data, callback) {
            databaseService.addCourse(req.body, callback);
        }
    ], (err, course) => {
        if (err) {
            return res.status(500).json(util.generateErrorJSON(500, err.message));
        }
        if (course) {
            return res.status(200).json(course);
            // We need to Emit Event Here
        } else {
            return res.status(404).json(util.generateErrorJSON(404, 'The request resource is not found'));
        }
    });
});

router.put('/:id', (req, res) => {
    async.waterfall([
        async.apply(databaseService.findOneById, req.params.id),
        util.resourceExists,
        function(data, callback) {
            databaseService.validateInput(req.body, callback);
        },
        databaseService.saveHistory,
        function(data, callback) {
            databaseService.updateCourse(req.params.id, req.body, callback);
        }
    ], (err, course) => {
        if (err) {
            return res.status(500).json(util.generateErrorJSON(500, err.message));
        }
        if (course) {
            return res.status(200).json(course);
        	// We need to Emit Event Here
        } else {
            return res.status(404).json(util.generateErrorJSON(404, 'The request resource is not found'));
        }
    });
});

router.delete('/:id', (req, res) => {
    async.waterfall([
        async.apply(databaseService.findOneById, req.params.id),
        util.resourceExists,
        databaseService.saveHistory,
        function(data, callback) {
            databaseService.deleteCourse(req.params.id, callback);
        }
    ], (err) => {
        if (err) {
            return res.status(500).json(util.generateErrorJSON(500, err.message));
        }
        return res.status(204).end();
        // We need to Emit Event Here
    });
});

module.exports = router;
