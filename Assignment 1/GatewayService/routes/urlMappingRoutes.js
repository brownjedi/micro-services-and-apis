"use strict";

// Module dependencies
const express = require('express');
const router = express.Router();
const urlMapping = require('./../models/urlMapping');
const dataConverter = require('./../utilities/dataConverter');
const errorHandler = require('./../utilities/errorHandler');

const urlMappingCollection = urlMapping.urlMappingCollection;

router.post('/', (req, res) => {
	//Add a new mapping to mongoDB

	if (req.body.mappings == undefined) {
		return res.status(400).send(errorHandler.getErrorJSON(400, "Bad Request. No request body. POST method must contain body."));
	}

	var newMapping = dataConverter.fromJSONToMappingDB(req.body);

	if (newMapping[0] == undefined || newMapping[0].publishedURL == undefined || newMapping[0].privateURL == undefined) {
		//Bad request since one of the parameters is not present
		return res.status(400).send(errorHandler.getErrorJSON(400, "Bad Request. Incomplete request body. POST method must contain data."));
	}

	//Check if a document exists. If not, create a new document to be inserted into mongoDB
	urlMappingCollection.find({publishedURL: newMapping[0].publishedURL}, function(err, existingMappings) {
		if (err) {
			return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
		}
		else {
			// object of the mapping
			if (existingMappings[0] != undefined && existingMappings[0] != null) {
  				return res.status(409).send(errorHandler.getErrorJSON(409, "Mapping already exists for " + existingMapping.publishedURL));
  			}

  			let mapping = new urlMappingCollection({publishedURL: newMapping[0].publishedURL, privateURL: newMapping[0].privateURL});

			mapping.save(function (err, mapping) {
	  			if (err) {
					return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
	  			}
	  			else {
	  				return res.status(200).send(dataConverter.fromMappingDBtoJSON([mapping]));
	  			}
			});
		}
	});
});




router.get('/', (req, res) => {
	//Access mongoDB to get the results from the mapping collection
	urlMappingCollection.find({}, function(err, mappings) {
  		if (err) {
  			return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
  		}
  		else {
  			// object of all the mappings
  			return res.status(200).send(dataConverter.fromMappingDBtoJSON(mappings));
  		}
	});
});




router.get('/:id', (req, res) => {
	//Access mongoDB to get the results for the particular route id
	if (!isNaN(req.params.id)) {
		urlMappingCollection.find({ mapping_id: req.params.id }, function(err, mappings) {
  			if (err) {
  				return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
  			}
  			else {
  				// object of the mapping
  				if (mappings[0] == null) {
  					return res.status(404).send(errorHandler.getErrorJSON(404, "Mapping id does not exist"));
  				}
  				return res.status(200).send(dataConverter.fromMappingDBtoJSON(mappings));
  			}
		});
	}
});





router.put('/:id', (req, res) => {
	
	//Modify the URL that a published URL is mapped to given the id of the mapping
	if (!isNaN(req.params.id)) {
		if (req.body == undefined) {
			return res.status(400).send(errorHandler.getErrorJSON(err.status, "Bad Request. No request body. PUT method must contain body."));
		}

		var newMapping = dataConverter.fromJSONToMappingDB(req.body);

		if (newMapping[0] == undefined || newMapping[0].privateURL == undefined) {
			return res.status(400).send(errorHandler.getErrorJSON(400, "Bad request. Incomplete request body. PUT requires data in body."));
		}

		urlMappingCollection.find({ mapping_id: req.params.id }, function(err, mappings) {
			if (err) {
  				return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
  			}
  			else {
  				// object of the mapping
  				if (mappings[0] == null) {
  					return res.status(404).send(errorHandler.getErrorJSON(404, "Mapping id does not exist"));
  				}

  				mappings[0].privateURL = newMapping[0].privateURL;
  				mappings[0].save(function(err, newMapping) {
    				if (err) {
    					return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
    				}

    				return res.status(200).send(dataConverter.fromMappingDBtoJSON([newMapping]));
    			});
  			}
  		});
  	}
});




router.put('/', (req, res) => {
	//Modify the URL that a published URL is mapped to given the publishedURL whose mapping is to be changed
	if (req.body == undefined) {
		return res.status(400).send(errorHandler.getErrorJSON(err.status, "Bad Request. No request body. PUT method must contain a body."));
	}

	var newMapping = dataConverter.fromJSONToMappingDB(req.body);

	if (newMapping[0] == undefined || newMapping[0].publishedURL == undefined || newMapping[0].privateURL == undefined) {
		return res.status(400).send(errorHandler.getErrorJSON(400, "Bad request. Incomplete request body. PUT requires data in request body."));
	}

	urlMappingCollection.find({publishedURL: newMapping[0].publishedURL}, function(err, mappings) {
		if (err) {
			return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
		}
		else {
			// object of the mapping
			if (mappings[0] == null) {
  				return res.status(404).send(errorHandler.getErrorJSON(404, "Mapping id does not exist"));
  			}

			mappings[0].privateURL = newMapping[0].privateURL;

			mappings[0].save(function(err, afterModifyMapping) {
				if (err) {
					return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
				}

				return res.status(200).send(dataConverter.fromMappingDBtoJSON([afterModifyMapping])); //Converting to array since fromMappingDBtoJSON works on arrays
			});
		}
	});
});




router.delete('/:id', (req, res) => {
	//Delete based on the id of a mapping given
	if (!isNaN(req.params.id)) {

		urlMappingCollection.find({ mapping_id: req.params.id }, function(err, mappings) {
			if (err) {
  				return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
  			}
  			else {
  				// delete mapping
  				if (mappings[0] == null) {
  					return res.status(404).send(errorHandler.getErrorJSON(404, "Mapping id does not exist"));
  				}

  				mappings[0].remove(function(err) {
    				if (err) {
    					return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
    				}

    				return res.status(204).send("No Content");
    			});
    		}
    	});
  	}
});




router.delete('/', (req, res) => {
	//Delete based on a publishedURL given

	if (req.body == undefined) {
		return res.status(400).send(errorHandler.getErrorJSON(err.status, "Bad Request. No request body. DELETE method must contain a body or a mapping id."));
	}

	var newMapping = dataConverter.fromJSONToMappingDB(req.body);

	if (newMapping[0] == undefined || newMapping[0].publishedURL == undefined) {
		return res.status(400).send(errorHandler.getErrorJSON(400, "Bad request. Incomplete request body. DELETE method requires data in request body or a mapping id."));
	}

	urlMappingCollection.find({publishedURL: newMapping[0].publishedURL}, function(err, mappings) {
		if (err) {
			return res.status(err.status).send(err.message);
		}
		else {
			// delete mapping
			if (mappings[0] == null) {
  				return res.status(404).send(errorHandler.getErrorJSON(404, "Mapping id does not exist"));
  			}

			mappings[0].remove(function(err) {
				if (err) {
					return res.status(err.status).send(err.message);
				}

				return res.status(204).send("No Content");
			});
		}
	});
});



module.exports = router;

