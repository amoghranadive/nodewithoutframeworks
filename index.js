/*
 * Primary file for the API 
 */

// Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

var server = http.createServer(function(req, res) {

    // Get the URL and parse it
    var parsedURL = url.parse(req.url, true);

    // Get the path
    var path = parsedURL.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // get the query string as an object
    var queryStringObject = parsedURL.query;

    // get the HTTP method
    var method = req.method.toUpperCase();

    // get the headers
    var headers = req.headers;

    // get the payload, if any
    var decoder = new StringDecoder('utf-8');
    var buffer = '';

    req.on('data', (data) => {
        buffer += decoder.write(data);
    });

    req.on('end', () => {
        buffer += decoder.end();

        // choose the handler the request should go to
        var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

        // construct the data object to send to the handler
        var data = {
            trimmedPath,
            queryStringObject,
            method,
            headers,
            'payload': buffer
        };

        console.log(`Request received on ${trimmedPath} with method: ${method}`);
        console.log('Query string parameters: %j', queryStringObject);    
        console.log("Headers: %j", headers);
        console.log(`Payload: ${buffer}`);

        // route the request to the handler
        chosenHandler(data, function sendResponse(statusCode, payload) {

            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
            payload = typeof(payload) == 'object' ? payload : {};
            
            // convert the payload to a string
            var payloadString = JSON.stringify(payload);

             // return the response
            res.setHeader('Content-Type', 'application/json');           
            res.writeHead(statusCode);
            res.end(payloadString);

            console.log(`Returing payload ${payloadString} with status code: ${statusCode}`);
        });
    });
})

// start the server
server.listen(3000, function() {
    console.log("Server is now up and running on port 3000");
})

// define handlers
var handlers = {};

// Sample handler
handlers.sample = function sampleHandler(data, callback) {
    // callback a http status code and payload object
    callback(200, {"name": "handled sample route"});
};

// default handler
handlers.notFound = function defaultHandler(data, callback) {
    callback(404);
};

// Define a request router
var router = {
    'sample': handlers.sample
}