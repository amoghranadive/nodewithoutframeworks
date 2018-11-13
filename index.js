/*
 * Primary file for the API 
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');

const config = require('./config');

// Instantiate the HTTP server
var httpServer = http.createServer(function(req, res) {
    unifiedServer(req, res);
});

// start the HTTP server
httpServer.listen(config.httpPort, function() {
    console.log(`${config.envName} Server is now up and running on port ${config.httpPort}`);
});

// Instantiate the HTTPS server
var httpsServerOptions = {
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem'),
};
var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
    unifiedServer(req, res);
});

// start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
    console.log(`${config.envName} Server is now up and running on port ${config.httpsPort}`);
})

// All the server logic for both http and https
var unifiedServer = function(req, res) {

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
};

// define handlers
var handlers = {};

// ping handler
handlers.ping = function pingHandler(data, callback) {
    callback(200);
}

// default handler
handlers.notFound = function defaultHandler(data, callback) {
    callback(404);
};

// Define a request router
var router = {
    'ping': handlers.ping
}