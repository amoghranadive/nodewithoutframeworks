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


module.exports = helpers;