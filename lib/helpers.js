/**
 * helpers for various tasks
 */

// Dependencies
const crypto = require('crypto');
const config = require('./config');

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


module.exports = helpers;