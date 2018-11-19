
const filesys = require('../data');
const helpers = require('../helpers');

var tokens = (function() {

    var publicAPI = {
        POST: createToken,
        GET: getToken,
        PUT: updateToken,
        DELETE: deleteToken,
    };

    return publicAPI;

    // required: phone, password
    // optional: none
    function createToken(data, callback) {

        // validate
        var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
        var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

        if (phone && password) {

            // lookup user
            filesys.read('users', phone, function(err, userData) {

                if (!err && userData) {

                    let hashedPassword = helpers.hashString(password);
                    if (hashedPassword === userData.hashedPassword) {

                        // create a new token with random date, expiration date 1hr in the future.
                        let tokenId = helpers.createRandomString(20);
                        let expires = Date.now() + 1000*60*60; 

                        let tokenObj = {
                            phone,
                            'id': tokenId,
                            expires
                        }

                        // store the token
                        filesys.create('tokens', tokenId, tokenObj, function(err) {
                            if (!err) {
                                callback(200, tokenObj);
                            } else {
                                callback(500, {'Error': 'Failed to create user token.'})
                            }
                        });

                    } else {
                        callback(400, {'Error': 'Password does not match.'});
                    }

                } else {
                    callback(400, {'Error': 'Could not find the specified user.'});
                }
            });

        } else {
            callback(400, {'Error': 'Missing required field.'});
        }
    }

    // required: Id
    // Optional: none
    function getToken(data, callback) {
        // validate
        var tokenId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

        if (tokenId) {
                   
            filesys.read('tokens', tokenId, function(err, tokenData) {

                if (!err && tokenData) {
                    callback(200, tokenData);

                } else {
                    callback(404);
                }

            });
        } else {
            callback(400, {'Error': 'Missing required field.'});
        }
    }

    // required: Id, extend
    // Optional: none
    function updateToken(data, callback) {

        // validate
        var tokenId = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
        var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

        if (tokenId && extend) {

            // Lookup the token
            filesys.read('tokens', tokenId, function(err, tokenData) {
                if (!err && tokenData) {

                    // check to make sure that the token isn't already expired
                    if (tokenData.expires > Date.now()) {

                        tokenData.expires = Date.now() + 1000*60*60; 

                        filesys.update('tokens', tokenId, tokenData, function(err) {
                            if (!err) {
                                callback(200, tokenData);
                            } else {
                                callback(500, {'Error': 'Failed to update token.'})
                            }
                        })

                    } else {
                        callback(400, {'Error': 'Token has already expired and it cannot be extended.'})
                    }

                } else {
                    callback(400, {'Error': 'Specified token does not exist.'})
                }
            })
        } else {
            callback(400, {'Error': 'Missing required fields or fields are invalid.'})
        }
    }

    function deleteToken(data, callback) {

        // validate
        var tokenId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

        if (tokenId) {

            // lookup token
            filesys.read('tokens', tokenId, function(err, tokenData) {

                if (!err) {

                    filesys.delete('tokens', tokenId, function(err) {

                        if (!err) {
                            callback(200);
                        } else {
                            callback(400, {'Error': 'Failed to delete token.'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'Token does not exist.'})
                }
            });
                    

        } else {
            callback(400, {'Error': 'Missing required field.'});
        }
    }
})();


module.exports = tokens;