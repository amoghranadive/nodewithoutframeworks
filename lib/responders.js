
const os = require('os');
const v8 = require('v8');
const filesys = require('./data');
const logger = require('./logger');

var responders = (function() {

    var publicAPI = {
        help,
        exit,
        stats,
        listUsers,
        moreUserInfo,
        listChecks,
        moreCheckInfo,
        listLogs,
        moreLogInfo
    };

    return publicAPI;

    function exit() {
        process.exit(0);
    }

    function help() {

        const commands = {
            'exit': 'Kill the cli (and the rest of the application)',
            'man': 'Show this help page',
            'help': 'Show this help page',            
            'stats': 'Show stats on unlerlying OS and resource utilization',
            'list users': 'List all registered users',
            'more user info --{userId}': 'Show details for the specified user',
            'list checks --up --down': 'Show list of all active checks in the system. up/down flags are optional.',
            'more check info --{checkId}': 'Show details doe the specified check',
            'list logs': 'List all log files (compressed only)',
            'more log info --{fileName}': 'Show contents of the specified log file'
        };

        // show a header fot the help page that is as wide as the screen
        drawHorizontalLine();
        centerText('CLI MANUAL');     
        drawHorizontalLine();        
        writeEmptyLines(2);

        // show each command followed by its explanation
        for (let command in commands) {
            if (commands.hasOwnProperty(command)) {
                let description = commands[command];
                let line = '\x1b[33m' + command + '\x1b[0m';
                let padding = 60 - line.length;

                for (let i = 0; i < padding; ++i) {
                    line += ' ';
                }

                line += description;
                console.log(line);
                writeEmptyLines(1);
            }
        }

        writeEmptyLines(1);
        drawHorizontalLine();
    }

    function stats() {
        
        var stats = {
            'Load Average': os.loadavg().join(' '),
            'CPU Count': os.cpus().length,
            'Free Memory': os.freemem(),
            'Current Malloced Memory': v8.getHeapStatistics().malloced_memory,
            'Peak Malloced Memory': v8.getHeapStatistics().peak_malloced_memory,
            'Allocated Heap Used (%)': Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
            'Available Heap Allocated (%)': Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
            'Uptime': os.uptime() + ' Seconds',
        }

        // show a header fot the help page that is as wide as the screen
        drawHorizontalLine();
        centerText('SYSTEM STATISTICS');     
        drawHorizontalLine();        
        writeEmptyLines(2);

        // show each command followed by its explanation
        for (let key in stats) {            
            if (stats.hasOwnProperty(key)) {
                let value = stats[key];
                let line = '\x1b[33m' + key + '\x1b[0m';
                let padding = 60 - line.length;

                for (let i = 0; i < padding; ++i) {
                    line += ' ';
                }

                line += value;
                console.log(line);
                writeEmptyLines(1);
            }
        }

        writeEmptyLines(1);
        drawHorizontalLine();
    }

    function listUsers() {

        filesys.list('users', function(err, data) {

            if (!err && data && data.length > 0) {

                writeEmptyLines(1);
                
                data.forEach(function(fileName) {

                    filesys.read('users', fileName, function(err, userData) {

                        if (!err && userData) {

                            let line = 'Name: '+userData.firstName+' '+userData.lastName+' Phone: '+userData.phone+' Checks: ';
                            var numberOfChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array 
                                                    && userData.checks.length > 0 
                                                    ? userData.checks.length : 0;
                            line += numberOfChecks;
                            console.log(line);
                            writeEmptyLines(1);
                        }
                    });
                });
            }
        });
    }

    function moreUserInfo(str) {

        // get the id from the string
        var arr = str.split('--');
        var userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

        if (userId) {

            filesys.read('users', userId, function(err, userData) {
                
                if (!err && userData) {
                    
                    delete userData.hashedPassword;

                    // print JSON with text highlighting
                    writeEmptyLines(1);
                    console.dir(userData, {'colors': true});
                    writeEmptyLines(1);
                }
            });
        }

    }

    function listChecks(str) {

        var listUpChecks = str.indexOf('--up') != -1;
        var listDownChecks = str.indexOf('--down') != -1;

        if (!listUpChecks && !listDownChecks) {
            listUpChecks = true;
            listDownChecks = true;
        }

        filesys.list('checks', function(err, data) {

            if (!err && data && data.length > 0) {

                writeEmptyLines(1);
                
                data.forEach(function(fileName) {

                    filesys.read('checks', fileName, function(err, checkData) {

                        if (!err && checkData) {

                            if ((listUpChecks && checkData.state === 'up') || (listDownChecks && checkData.state === 'down')) {

                                var line = 'ID: ' + checkData.id + ' ' + checkData.method.toUpperCase() + ' ' + checkData.protocol + '://' + checkData.url + ' State: ' + checkData.state;
                                console.log(line);
                                writeEmptyLines(1);

                            }
                        }
                    });
                });
            }
        });
    }

    function moreCheckInfo(str) {

        // get the id from the string
        var arr = str.split('--');
        var checkId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;

        if (checkId) {

            filesys.read('checks', checkId, function(err, checkData) {
                
                if (!err && checkData) {
                    
                    // print JSON with text highlighting
                    writeEmptyLines(1);
                    console.dir(checkData, {'colors': true});
                    writeEmptyLines(1);
                }
            });
        }
    }

    function listLogs(str) {

        logger.list(true, function(err, data) {

            if (!err && data && data.length > 0) {

                writeEmptyLines(1);
                
                data.forEach(function(fileName) {
                    if (fileName.indexOf('-') != -1) {
                        console.log(fileName);
                        writeEmptyLines(1);
                    }
                });
            }
        });
    }

    function moreLogInfo(str) {

    }

    function drawHorizontalLine() {

        // get the available screen size
        var width = process.stdout.columns;
        var line = '';

        for (let i = 0; i < width; ++i) {
            line += '-';
        }
        console.log(line);
    }

    function writeEmptyLines(numofLines) {

        numofLines = typeof(numofLines) == 'number' && numofLines > 0 ? numofLines : 1;
        
        for (let i = 0; i < numofLines; ++i) {
            console.log('');
        }
    }

    function centerText(str) {

        str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';

        // get the available screen size
        var width = process.stdout.columns;
        
        var leftPadding = Math.floor( (width-str.length)/2 );

        var line = '';
        for (let i = 0; i < leftPadding; ++i) {
            line += ' ';
        }        
        line += str;

        console.log(line);
    }

})();

module.exports = responders;