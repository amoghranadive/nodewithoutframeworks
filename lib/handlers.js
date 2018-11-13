/**
 * Request handlers
 */

 const filesys = require('./data');
 const helpers = require('./helpers');

 // define handlers
var handlers = function()  {

    const acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];

    var publicAPI = {
        notFound: defaultHandler,
        ping: pingHandler,
        userHandler,
        tokenHandler,
    }

    return publicAPI;

    function defaultHandler(data, callback) {
        callback(404);
    };

    function pingHandler(data, callback) {
        callback(200);
    }

    function userHandler(data, callback) {        
  
        if (acceptableMethods.indexOf[data.method] != -1) {
            users[data.method](data,callback);
        } else {
            callback(405);
        }
    }

    function tokenHandler(data, callback) {
   
        if (acceptableMethods.indexOf[data.method] != -1) {
            tokens[data.method](data,callback);
        } else {
            callback(405);
        }
    }

};


var users = (function() {

    var publicAPI = {
        POST: createUser,
        GET: getUser,
        PUT: updateUser,
        DELETE: deleteUser
    };
    
    return publicAPI;

    // Users - post
    // Required: firstname, lastname, phone, password, tosagreement
    // Optional: none
    function createUser(data, callback) {
        
        // validate
        var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
        var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim(): false;
        var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
        var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
        var tosagreement = typeof(data.payload.tosagreement) == 'boolean' && data.payload.tosagreement == true ? true : false;

        if (firstName && lastName && phone && password && tosagreement) {

            // Make sure that the user already does not exist
            filesys.read('users', phone, function(err, fileData) {
                if (err) {
                    // Hash the password
                    let hashedPassword = helpers.hashString(password);

                    if (hashedPassword) {
                        // create the user object
                        let userObj = {
                            firstName,
                            lastName,
                            phone,
                            hashedPassword,
                            tosagreement: true
                        };

                        // store the user
                        filesys.create('users', phone, userObj, function(err) {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, {'Error': 'Failed to create new user.'})
                            }
                        });
                    } else {
                        callback(500, {'Error': 'Failed to hash password.'})
                    }
                } else {
                    callback(400, {'Error': 'A user with that phone number already exits.'})
                }
            })

        } else {
            callback(400, {'Error': 'Missing required fields.'});
        }
    }

    // users - get
    // Required: phone
    // Optional: none
    // @TODO: Only let authenticated users access data
    function getUser(data, callback) {

        // validate
        var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

        if (phone) {
                   
            filesys.read('users', phone, function(err, userData) {

                if (!err && userData) {
                    // remove the hashed password from the object before returning
                    delete userData.hashedPassword;
                    callback(200, userData);

                } else {
                    callback(404);
                }

            })
        } else {
            callback(400, {'Error': 'Missing required field.'});
        }
    }

    // Users - put
    // Required: phone
    // Optional: everything else (but atleast one must be provided)
    // @TODO: Authentication
    function updateUser(data, callback) {

        // validate
        var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;  

        // optional fields
        var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
        var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim(): false;
        var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

        if (phone) {

            if (firstName || lastName || password) {

                // lookup user
                filesys.read('users', phone, function(err, userData) {

                    if (!err && userData) {

                        // set appropriate fields
                        if (firstName) {
                            userData.firstName = firstName;
                        }
                        if (lastName) {
                            userData.lastName = lastName;
                        }
                        if (password) {
                            userData.hashedPassword = helpers.hashString(password);
                        }

                        // update user
                        filesys.update('users', phone, userData, function(err) {
                            if (!err) {
                                callback(200);
                            } else {
                                callback(500, {'Error': 'Could not update the user.'})
                            }
                        });

                    } else {
                        callback(400, {'Error': 'User does not exist.'})
                    }
                });

            } else {
                callback(400, {'Error': 'Missing fields to update.'})
            }

        } else {
            callback(400, {'Error': 'Missing required field.'});
        }        

    }

    // users - delete
    // Required: phone
    // Optional: none
    // @TODO: Only let authenticated users delete data
    function deleteUser(data, callback) {

        // validate
        var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

        if (phone) {

            // lookup user
            filesys.read('users', phone, function(err, userData) {

                if (!err) {
                    filesys.delete('users', phone, function(err) {

                        if (!err) {
                            callback(200);
                        } else {
                            callback(400, {'Error': 'Failed to delete user.'});
                        }
                    });
                } else {
                    callback(400, {'Error': 'User does not exist.'})
                }
            });
                   

        } else {
            callback(400, {'Error': 'Missing required field.'});
        }
    }
})();



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

    function getToken(data, callback) {

    }

    function updateToken(data, callback) {

    }

    function deleteToken(data, callback) {

    }
})();


module.exports = handlers();