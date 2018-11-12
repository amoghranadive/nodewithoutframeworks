/*
 * Primary file for the API 
 */

// Dependencies
const http = require('http');
const url = require('url');

var server = http.createServer(function(req, res) {

    // Get the URL and parse it
    var parsedURL = url.parse(req.url, true);

    // Get the path
    var path = parsedURL.pathname
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // send the response
    res.end("hello World\n");

    // log the request path
    console.log(`Request received on ${trimmedPath}`);    
})

// start the server
server.listen(3000, function() {
    console.log("Server is now up and running on port 3000");
})