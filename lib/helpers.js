/**
 * helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

var helpers = {};

helpers.hashString = function hashString(data) {

    if (typeof(data) == 'string' && data.length > 0) {
        var hash = crypto.createHmac('sha256', config.hashSecret).update(data).digest('hex');
        return hash;
    } else {
        return false;
    }
};

// Parse JSON string to an object in all cases, without throwing
helpers.parseJSONToObject = function parseJSONToObject(data) {
    
    try {

        var obj = JSON.parse(data);
        return obj;

    } catch (err) {
        return {}; 
    }
};


helpers.createRandomString = function createRandomString(length) {

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



helpers.sendTwilioSMS = function(phone, msg, callback) {

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


module.exports = helpers;