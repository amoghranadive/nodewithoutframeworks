/*
 * Primary file for the API 
 */

const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

// Declare the app
const app = {};

app.init = function(callback) {

    // start the server
    server.init();

    // start the workers
    workers.init();

    // start the cli, but make sure that it starts last
    setTimeout(function() {
      cli.init();
      callback();
    }, 50);   
};

// self invoking, only if required directly
  if (require.main === module) {
    app.init(function() {});
  }

// export the app
 module.exports = app;
