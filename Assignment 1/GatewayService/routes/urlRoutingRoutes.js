"use strict";

// Module dependencies
const express = require('express');
const request = require('request');
const router = express.Router();
const urlMapping = require('./../models/urlMapping');
const dataConverter = require('./../utilities/dataConverter');
const errorHandler = require('./../utilities/errorHandler');

const urlMappingCollection = urlMapping.urlMappingCollection;

router.all('/*', (req, res) => {
	//Route all requests according to the stored mapping
	let publishedURL = req.originalUrl;
	console.log("Host: " + req.protocol + '://' + req.get('host') + publishedURL);

	let urlParts = publishedURL.substring(1).split("/");
	console.log(urlParts);

	let searchURL = '/' + urlParts[0] + '/' + urlParts[1];
	let remainingURL = "";
	for (let i=2; i<urlParts.length; i++) {
		if (urlParts[i] != '') {
			remainingURL = remainingURL + '/' + urlParts[i];
		}
	}

	//Check if a document exists. If not, error out
	urlMappingCollection.find({publishedURL: searchURL}, function(err, existingMappings) {
		if (err) {
			return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
		}
		else {
			// object of the mapping
			if (existingMappings.length > 0) {
				let newURL = req.protocol + '://' + req.get('host') + existingMappings[0].privateURL + remainingURL;
				console.log("NewURL: " + newURL);

				request({
    				url: newURL, //URL to hit
    				method: req.method, //Specify the method
    				json: req.body,
    				headers: { //We can define headers too
        				'Content-Type': req.get('Content-Type')
    				}
				}, function (error, response, body) {
					if (error) {
						console.log(err.status + " - " + err.message);
					}
					console.log(body);
					console.log(response.statusCode + " ----- " + response.body);
 					if (error) {
 						return res.status(error.status).send(errorHandler.getErrorJSON(error.status, error.message));
 					}

 					return res.status(response.statusCode).send(response.body);

				});
  			}
  			else {
  				return res.status(404).send(errorHandler.getErrorJSON(404, "Resource not found"));
  			} 
  		}
	});
});

module.exports = router;