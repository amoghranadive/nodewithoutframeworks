/**
 * helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');
const path = require('path');
const fs = require('fs');

var helpers = (function() {

    var publicAPI = {
        hashString,
        parseJSONToObject,
        createRandomString,
        sendTwilioSMS,
        getTemplate,
        addUniversalTemplates
    };

    return publicAPI;

    function hashString(data) {

        if (typeof(data) == 'string' && data.length > 0) {
            var hash = crypto.createHmac('sha256', config.hashSecret).update(data).digest('hex');
            return hash;
        } else {
            return false;
        }
    }

    // Parse JSON string to an object in all cases, without throwing
    function parseJSONToObject(data) {
        
        try {

            var obj = JSON.parse(data);
            return obj;

        } catch (err) {
            return {}; 
        }
    }

    function createRandomString(length) {

        const possibleChars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    
        length = typeof(length) == 'number' && length > 0 ? length : false;
        if (length) {        
            var str = '';
            for (let i = 0; i < length; ++i) {
                str += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
            }
            return str;
        } else {
            return false;
        }
    }

    function sendTwilioSMS(phone, msg, callback) {

        phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;
        msg = typeof(msg) == 'string' && msg.trim().length > 0 && msg.trim.length <= 1600 ? msg.trim() : false;
    
        if (phone && msg) {
    
            let payload = {
                'From' : config.twilio.fromPhone,
                'To': '+1'+phone,
                'Body': msg
            };
    
            let stringPayload = querystring.stringify(payload);
    
            // configure the request details
            let requestDetails = {
                'protocol': 'https:',
                'hostname': 'api.twilio.com',
                'method': 'POST',
                'path': '/2010-04-01/Accounts/' + config.twilio.accountSid + '/Messages.json',
                'auth': config.twilio.accountSid + ':' + config.twilio.authToken,
                'headers': {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(stringPayload)
                }
            };
    
            let req = https.request(requestDetails, function(res) {
    
                let status = res.statusCode;
    
                if (status == 200 || status == 201) {
                    callback(false);
                } else {
                    callback('Status Code returned was: ' + status);
                }
            });
    
            req.on('error', function(err) {
                callback(e);
            });
    
            req.write(stringPayload);
    
            req.end();
    
        } else {
            callback('Missing or invalid parameters.');
        }
    }

    function getTemplate(templateName, data, callback) {

        templateName = typeof(templateName) == 'string' && templateName.length > 0 ? templateName : false;
        data = typeof(data) == 'object' && data !== null ? data : {};
    
        if (templateName) {
    
            let templatesDir = path.join(__dirname, '..', 'templates');
    
            fs.readFile(templatesDir + '/' + templateName + '.html', 'utf8', function(err, str) {
    
                if (!err && str) {
                    
                    // do the interpolation
                    let finalString = interpolate(str, data);
                    callback(false, finalString);
    
                } else {
                    callback('No template could be found.')
                }
            });
    
        } else {
            callback('A valid template name was not specified.')
        }
    }

    function interpolate(str, data) {

        str = typeof(str) == 'string' && str.length > 0 ? str : '';
        data = typeof(data) == 'object' && data !== null ? data : {};
    
        // Add the templateGlobals to teh data object, prepending their key name with "global"
        for (let keyName in config.templateGlobals) {
            if (config.templateGlobals.hasOwnProperty(keyName)) {
                data['global.' + keyName] = config.templateGlobals[keyName];
            }
        }
    
        for (let key in data) {
            if (data.hasOwnProperty(key) && typeof(data[key]) == 'string') {
                let replace = data[key];
                let find = '{' + key + '}';
                str = str.replace(find, replace);
            }
        }
    
        return str;
    }

    function addUniversalTemplates(str, data, callback) {

        str = typeof(str) == 'string' && str.length > 0 ? str : '';
        data = typeof(data) == 'object' && data !== null ? data : {};
    
        getTemplate('_header', data, function(err, headerString) {
    
            if (!err && headerString) {
    
                helpers.getTemplate('_footer', data, function(err, footerString) {
    
                    if (!err && footerString) {
    
                        let fullString = headerString + str + footerString;
                        callback(false, fullString);
    
                    } else {
                        callback('could not find the footer string.')
                    }
                });
            } else {
                callback('could not get the header.')
            }
        })
    }


})();






















module.exports = helpers;