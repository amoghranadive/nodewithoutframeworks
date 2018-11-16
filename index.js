/*
 * Primary file for the API 
 */

 const server = require('./lib/server');
 const workers = require('./lib/workers');

 // Declare the app
 const app = {};

 app.init = function() {

    // start the server
    server.init();

    // start the workers
    workers.init();
 };

 // Execute
 app.init();

 // export the app
 module.exports = app;
