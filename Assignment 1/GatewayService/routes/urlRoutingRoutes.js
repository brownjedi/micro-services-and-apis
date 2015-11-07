"use strict";

// Module dependencies
const express = require('express');
const request = require('request');
const router = express.Router();
const urlMapping = require('./../models/urlMapping');
const dataConverter = require('./../utilities/dataConverter');
const errorHandler = require('./../utilities/errorHandler');

const urlMappingCollection = urlMapping.urlMappingCollection;

const securityString = urlMapping.securityString;

router.all('/*', (req, res) => {
	//Route all requests according to the stored mapping
	let publishedURL = req.originalUrl;
	console.log("Host: " + req.get('host'));

	let hostParts = req.get('host').split(":");
	let hostname = hostParts[0]; //Host name is to be appended with the new port number for rerouting

	let urlParts = publishedURL.substring(1).split("/");
	console.log(urlParts);

	let searchURL = '/' + urlParts[0] + '/' + urlParts[1]; //Project name + Micro Service name is used as the key for finding the private URL. Security features should be added to make the adding and removal of mapping end points inaccessible from outside.
	let remainingURL = "";
	for (let i=2; i<urlParts.length; i++) {
		if (urlParts[i] != '') {
			remainingURL = remainingURL + '/' + urlParts[i];
		}
	}

	let searchURLinDB = "/" + securityString + searchURL;
	console.log(searchURLinDB);

	//Check if a document exists. If not, error out
	urlMappingCollection.find({publishedURL: searchURLinDB}, function(err, existingMappings) {
		if (err) {
			return res.status(err.status).send(errorHandler.getErrorJSON(err.status, err.message));
		}
		else {
			// object of the mapping
			if (existingMappings.length > 0) {
				let newURL = req.protocol + '://' + hostname + ":" + existingMappings[0].port + existingMappings[0].privateURL + remainingURL;
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
						console.log(error.status + " - " + error.message);
					}
					// console.log(body);
					// console.log(response.statusCode + " ----- " + response.body);
 					if (error) {
 						if (error.status == undefined) {
 							error.status = 500;
 						}

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