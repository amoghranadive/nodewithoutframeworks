/**
 * Server related tasks
 */

// Dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const config = require('./config');
const handlers = require('./handlers');
const helpers = require('./helpers');
var path = require('path');

var server = (function() {

    // Define a request router
    var router = {
        '': handlers.index,
        'account/create': handlers.accountCreateHandler,
        'account/edit': handlers.accountEditnHandler,
        'account/deleted': handlers.accountDeleteHandler,
        'session/create': handlers.loginHandler,
        'session/deleted': handlers.logoutHandler,
        'checks/all': handlers.checkDashboardHandler,
        'checks/create': handlers.checkCreateHandler,
        'checks/edit': handlers.checkEditHandler,
        'ping': handlers.ping,
        'api/users': handlers.userHandler,
        'api/tokens': handlers.tokenHandler,
        'api/checks': handlers.checksHandler,
    }

    var publicAPI = {
        init: initServer,
    };

    return publicAPI;

    function initServer() {

        // Instantiate the HTTP server
        var httpServer = http.createServer(function(req, res) {
            unifiedServer(req, res);
        });

        // start the HTTP server
        httpServer.listen(config.httpPort, function() {
            console.log('\x1b[35m%s\x1b[0m', `${config.envName} Server is now up and running on port ${config.httpPort}`);
        });

        // Instantiate the HTTPS server
        var httpsServerOptions = {
            'key': fs.readFileSync(path.join(__dirname, '..', './https/key.pem')),
            'cert': fs.readFileSync(path.join(__dirname, '..', './https/cert.pem')),
        };
        var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
            unifiedServer(req, res);
        });

        // start the HTTPS server
        httpsServer.listen(config.httpsPort, function() {
            console.log('\x1b[36m%s\x1b[0m', `${config.envName} Server is now up and running on port ${config.httpsPort}`);
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
                    'payload': helpers.parseJSONToObject(buffer),
                };
        
                // console.log(`Request received on ${trimmedPath} with method: ${method}`);
                // console.log('Query string parameters: %j', queryStringObject);    
                // console.log("Headers: %j", headers);
                // console.log(`Payload: ${buffer}`);
        
                // route the request to the handler
                chosenHandler(data, function sendResponse(statusCode, payload, contentType) {
        
                    contentType = typeof(contentType) == 'string' ? contentType : 'application/json';
                    statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
        
                    // return the response parts that are content-specific
                    var payloadString = '';
                    if (contentType === 'json') {
                        
                        res.setHeader('Content-Type', 'application/json');  
                        payload = typeof(payload) == 'object' ? payload : {};
                        payloadString = JSON.stringify(payload);

                    } else if (contentType === 'html') {

                        res.setHeader('Content-Type', 'text/html');  
                        payloadString = typeof(payload) == 'string' ? payload : '';
                
                    }                     
                    
                    // return the response parts that are common to all content types
                    res.writeHead(statusCode);
                    res.end(payloadString);
        
                    console.log(`Returing payload ${payloadString} with status code: ${statusCode}`);
                });
            });
        };
    
    }
})();

module.exports = server;