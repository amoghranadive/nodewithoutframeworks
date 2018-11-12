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

        // send the response
        res.end("hello World\n");

        console.log(`Request received on ${trimmedPath} with method: ${method}`);
        console.log('Query string parameters: %j', queryStringObject);    
        console.log("Headers: %j", headers);
        console.log(`Payload: ${buffer}`);
    });
})

// start the server
server.listen(3000, function() {
    console.log("Server is now up and running on port 3000");
})