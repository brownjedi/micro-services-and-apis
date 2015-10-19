"use strict";

function fromMappingDBtoJSON(data) {
	var json = JSON.parse(JSON.stringify(data));

	var modifiedJSON = {
		mappings: []
	};

	if (json) {
		json.forEach(function(mapping) {
			var temp = {
				"id": mapping._id, 	
				"mapping_id": mapping.mapping_id,
				"data": {
				}
			};

			if (mapping.publishedURL) temp.data.publishedURL = mapping.publishedURL;
			if (mapping.privateURL) temp.data.privateURL = mapping.privateURL;		

			modifiedJSON.mappings.push(temp);

		});
	}

	return modifiedJSON;
}


function fromJSONToMappingDB(data) {
	var modifiedJSON = [];
	var json = JSON.parse(JSON.stringify(data));
	if (json.mappings != undefined) {
		json.mappings.forEach(function(mapping) {

			var temp = {
				"publishedURL": mapping.data.publishedURL,
				"privateURL": mapping.data.privateURL
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