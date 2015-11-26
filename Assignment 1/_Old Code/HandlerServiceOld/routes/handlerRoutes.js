'use strict';

// Module dependencies
var express = require('express');
var router = express.Router();
var Handler = require('./../models/handler');
var request = require('request');
var url = require('url');

// TODO: Make it more robust
function matcher(url1, url2) {
    var url1_parts = url1.split('/')
    var url2_parts = url2.split('/')

    if (url1_parts.length != url2_parts.length)
        return null;

    for (var i = 0; i < url1_parts.length; i++) {
        if (url1_parts[i] == url2_parts[i])
            continue;

        if (url1_parts[i] != url2_parts[i] && url1_parts[i].charAt(0) == ":")
            return url2_parts[i];
        else
            return null;
    }

    return null;
}

router.all('*', function(req, res) {
    var query = req.originalUrl;
    console.log(query, req.url, url.parse(req.url));

    if (query.charAt(0) == "/")
        query = query.substring(1, query.length);

    if (query.charAt(query.length - 1) == "/")
        query = query.substring(0, query.length - 1);

    Handler.find({
        "httpMethod": req.method
    }, function(err, results) {
        if (err) {
            return res.status(500).send(err.message);
        }
        var done = false;

        for (var i = 0; i < results.length; i++) {
            var id = matcher(results[i].templateUrl, query);

            if (id !== null) {
                // TODO: currently only checking the first character....make it more generic
                if (id.charAt(0).search(new RegExp(results[i].regex)) != -1) { //course regexp will be [a-z] in db
                    var newURL = results[i].targetUrl;
                    newURL = newURL.substring(0, newURL.lastIndexOf(':')) + id;
                    console.log("send req to this url: " + newURL, req.method, req.body, req.get('Content-Type'));
                    request({
                        url: newURL, //URL to hit
                        method: req.method, //Specify the method
                        data: req.body,
                        headers: { //We can define headers too
                            'Content-Type': req.get('Content-Type')
                        }
                    }, function(error, response, body) {
                        if (error) {
                            return res.status(error.status || 500).send(error.message);
                        }
                        console.log(JSON.stringify(response));
                        return res.status(response.statusCode).set('Content-Type', response.headers['content-type']).send(response.body);
                    });
                    done = true;
                    break;
                } //end of regex if condition
            }
        }

        if (!done) {
            return res.status(404).send("404: URL Not Found")
        }

    });

});

module.exports = router;