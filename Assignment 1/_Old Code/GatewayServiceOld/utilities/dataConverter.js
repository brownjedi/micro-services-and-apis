"use strict";

const urlMapping = require('./../models/urlMapping');
const securityString = urlMapping.securityString;

function fromMappingDBtoJSON(data) {
	let json = JSON.parse(JSON.stringify(data));

	let modifiedJSON = {
		mappings: []
	};

	if (json) {
		json.forEach(function(mapping) {
			let temp = {
				"id": mapping._id, 	
				"mapping_id": mapping.mapping_id,
				"data": {
				}
			};

			if (mapping.publishedURL) {
				//Remove security information from the result before display
				let publishedURLParts = mapping.publishedURL.substring(1).split("/");

				let publishedURL = mapping.publishedURL;

				if (publishedURLParts[0] === securityString) {
					publishedURL = "/";
					for (let i=1; i<publishedURLParts.length; i++) {
						publishedURL = publishedURL + publishedURLParts[i] + "/";
					}	
				}

				temp.data.publishedURL = publishedURL;
			} 
	
			if (mapping.privateURL) temp.data.privateURL = mapping.privateURL;
			if (mapping.port) temp.data.port = mapping.port;		

			modifiedJSON.mappings.push(temp);

		});
	}

	return modifiedJSON;
}


function fromJSONToMappingDB(data) {
	let modifiedJSON = [];
	let json = JSON.parse(JSON.stringify(data));
	if (json.mappings != undefined) {
		json.mappings.forEach(function(mapping) {

			let temp = {
				"publishedURL": mapping.data.publishedURL,
				"privateURL": mapping.data.privateURL,
				"port": mapping.data.port
			};

			if (mapping.id) {
				temp._id = mapping.id;
			}
			if (mapping.mapping_id) {
				temp.mapping_id = Number(mapping.mapping_id);
			}

			modifiedJSON.push(temp);
		});
	}

	return modifiedJSON;
}


module.exports = { fromMappingDBtoJSON, fromJSONToMappingDB };