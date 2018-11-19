/**
 * Worker related tasks
 */

const path = require('path');
const fs = require('fs');
const filesys = require('./data');
const https = require('https');
const http = require('http');
const url = require('url');
const logger = require('./logger');
const util = require('util');
var debug = util.debuglog('worker');

var workers = (function() {

    var publicAPI = {
        init: startChecks
    }

    return publicAPI;

    function startChecks() {

        console.log('\x1b[33m%s\x1b[0m', 'Background workers are running.');

        // execute all the checks
        gatherAllChecks();

        // call the loop so that the checks will execute later on
        loop();

        // compress all logs
        rotateLogs();

        // compression loop
        logRotationLoop();
    }

    function loop() {

        setInterval(function() {
            gatherAllChecks();

        }, 1000*60);
    }


    function logRotationLoop() {

        setInterval(function() {
            rotateLogs();
        }, 1000*60*60*24);
    }

    function gatherAllChecks() {

        // get all the checks that exist in the system
        filesys.list('checks', function(err, checks) {
            if (!err && checks && checks.length > 0) {

                checks.forEach(function(check) {

                    filesys.read('checks', check, function(err, originalCheckData) {
                        if (!err && originalCheckData) {
                            validateCheckData(originalCheckData);
                        } else {
                            debug('Error reading one of the checks data');
                        }
                    });
                });

            } else {
                debug('Error: could not find any checks to process.')
            }
        })
    }

    function validateCheckData(checkData) {

        checkData = typeof(checkData) == 'object' && checkData !== null ? checkData : false;

        if (checkData) {

            checkData.id = typeof(checkData.id) == 'string' && checkData.id.length == 20 ? checkData.id : false;
            checkData.phone = typeof(checkData.phone) == 'string' && checkData.phone.length == 10 ? checkData.phone : false;
            checkData.protocol = typeof(checkData.protocol) == 'string' && ['https', 'http'].indexOf(checkData.protocol) != -1 ? checkData.protocol : false;
            checkData.url = typeof(checkData.url) == 'string' && checkData.url.length > 0 ? checkData.url : false;
            checkData.method = typeof(checkData.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(checkData.method) != -1 ? checkData.method : false;
            
            checkData.successCodes = typeof(checkData.successCodes) == 'object' 
                                        && checkData.successCodes instanceof Array 
                                        && checkData.successCodes.length > 0 ? checkData.successCodes : false;

            checkData.timeoutSeconds = typeof(checkData.timeoutSeconds) == 'number' 
                                        && checkData.timeoutSeconds % 1 === 0
                                        && checkData.timeoutSeconds >= 1
                                        && checkData.timeoutSeconds <= 5 ? checkData.timeoutSeconds : false;

            checkData.state = typeof(checkData.state) == 'string' && ['up', 'down'].indexOf(checkData.state) != -1 ? checkData.state : 'down';
            checkData.lastChecked = typeof(checkData.lastChecked) == 'number' && checkData.lastChecked > 0 ? checkData.lastChecked : false;
            
            if (checkData.id && checkData.phone && checkData.protocol && checkData.url &&
                checkData.method && checkData.successCodes && checkData.timeoutSeconds) {
                    
                performCheck(checkData);

            } else {
                debug('Error: one of the checks is not properly formatted. Skipping it.')
            }

        } else {
            debug('Error: no checkdata to validate.');
        }
    }


    function performCheck(checkData) {

        var checkOutcome = {
            'error': false,
            'responseCode': false
        };

        var outcomeSent = false;

        var parsedUrl = url.parse(checkData.protocol + '://' + checkData.url, true);
        var hostname = parsedUrl.hostname;
        var path = parsedUrl.path; // Using path instead of pathname since we want the querystring.

        // configure the request details
        let requestDetails = {
            'protocol': checkData.protocol + ':',
            'hostname': hostname,
            'method': checkData.method.toUpperCase(),
            'path': path,
            'timeout': checkData.timeoutSeconds * 1000
        };

        let moduleToUse = checkData.protocol == 'http' ? http : https;

        let req = moduleToUse.request(requestDetails, function(res) {

            checkOutcome.responseCode = res.statusCode;

            if (!outcomeSent) {
                processCheckOutcome(checkData, checkOutcome);
                outcomeSent = true;
            }
        });

        // Bind to an error event so that it doesnt get thrown.
        req.on('error', function(err) {

            checkOutcome.error = {
                'error': true,
                'value': err
            };
            
            if (!outcomeSent) {
                processCheckOutcome(checkData, checkOutcome);
                outcomeSent = true;
            }
        });

        // bind to a timeout event
        req.on('timeout', function() {

            checkOutcome.error = {
                'error': true,
                'value': 'timeout'
            };
            
            if (!outcomeSent) {
                processCheckOutcome(checkData, checkOutcome);
                outcomeSent = true;
            }
        });

        req.end();
    }


    function processCheckOutcome(checkData, checkOutcome) {

        // set status
        var state = !checkOutcome.error && checkOutcome.responseCode && checkData.successCodes.indexOf(checkOutcome.responseCode) != -1 ? 'up' : 'down';

        // should alert?
        var alertWarranted = checkData.lastChecked && checkData.state != state ? true : false;

        // Log the outcome
        var timeOfCheck = Date.now();

        var newCheckData = checkData;
        newCheckData.state = state;
        newCheckData.lastChecked = timeOfCheck;

        log(checkData, checkOutcome, state, alertWarranted, timeOfCheck);

        filesys.update('checks', checkData.id, newCheckData, function(err) {
            if (!err) {
                if (alertWarranted) {
                    alertUser(newCheckData);
                } else {
                    debug('check outcome has not changed, no alert required.')
                }
            } else {
                debug('Failed saving updates to one of the checks.')
            }
        });
    }


    function alertUser(newCheckData) {

        var msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}.`;

        /*helpers.sendTwilioSMS(newCheckData.phone, msg, function(err) {
            if (!err) {
                debug('User has been alerted.')
            } else {
                debug('Could not send sms alert to user.')
            }
        });*/

        debug(msg);
    }


    function log(checkData, checkOutcome, state, alertWarranted, timeOfCheck) {

        var logData = {
            check: checkData,
            outcome: checkOutcome,
            state,
            alert: alertWarranted,
            time: timeOfCheck
        };

        var logString = JSON.stringify(logData);
        var logFileName = checkData.id;

        logger.append(logFileName, logString, function(err) {
            if (!err) {

            } else {
                debug('Logging to file failed.');
            }
        })

    }


    function rotateLogs() {

        // list all the non-compressed files
        logger.list(false, function(err, fileList) {

            if (!err && fileList && fileList.length > 0) {

                fileList.forEach(function(fileName) {

                    var logId = fileName.replace('.log', '');
                    var newFileId = logId + '-' + Date.now();

                    logger.compress(logId, newFileId, function(err) {

                        if (!err) {

                            logger.truncate(logId, function(err) {
                                if (!err) {
                                    debug('Log file truncated.');
                                } else {
                                    debug('Error truncating log file.');
                                }
                            });
                        } else {
                            debug('Error compressing one of the files: ', err);
                        }
                    });

                 });

            } else {
                debug('Could not find any logs to compress.');
            }

        });
    }
    
})();

module.exports = workers;
