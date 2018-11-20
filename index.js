/*
 * Primary file for the API 
 */

 const server = require('./lib/server');
 const workers = require('./lib/workers');
 const cli = require('./lib/cli');

 // Declare the app
 const app = {};

 app.init = function() {

    // start the server
    server.init();

    // start the workers
    workers.init();

    // start the cli, but make sure that it starts last
    setTimeout(function() {
      cli.init();
    }, 50);   
 };

 // Execute
 app.init();

 // export the app
 module.exports = app;
