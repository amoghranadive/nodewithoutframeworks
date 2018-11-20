/**
 * CLI related tasks
 */

// Dependencies
var readLine = require('readline');
var util = require('util');
var debug = util.debuglog('cli');

var events = require('events');
class _events extends events{};
var e = new _events();

var cli = (function() {

    const uniqueInputs = [
        'man',
        'help',
        'exit',
        'stats',
        'list users',
        'more user info',
        'list checks',
        'more check info',
        'list logs',
        'more log info'
    ];

    var publicAPI = {
        init
    };

    return publicAPI;

    function init() {

        // start msg in dark blue
        console.log('\x1b[34m%s\x1b[0m', `CLI is now running.`);

        // start the interface
        var interface = readLine.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: '>'
        });

        // create an initial prompt
        interface.prompt();

        // handle each line of input separately
        interface.on('line', function(str) {

            // send to the input processor
            processInput(str);

            // re-init the prompt
            interface.prompt();
        });

        // if the user stops the CLI, kill the associated process
        interface.on('close', function() {
            process.exit(0);
        });

    }

    function processInput(str) {

        str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;

        if (!str) {
            return;
        }

        // codify the unique strings that identify the unique questions allowed to be used.
        var matchFound = false;
        var counter = 0;

        uniqueInputs.some(function(input) {

            if (str.toLowerCase().indexOf(input) != -1) {
                matchFound = true;
                
                // Emit an event matching the unique input
                e.emit(input, str);
                return true;
            }
        });

        if (!matchFound) {
            console.log('Sorry, try again.');
        }
    }

})();

module.exports = cli;