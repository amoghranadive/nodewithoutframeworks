const filesys = require('../data');
const helpers = require('../helpers');
const utils = require('./utils');

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
    function getUser(data, callback) {

        // validate
        var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

        if (phone) {

            // Get the token from the headers
            let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            if (tokenId) {

                utils.verifyToken(tokenId, phone, function(isValid) {
                    if (isValid) {
                        filesys.read('users', phone, function(err, userData) {

                            if (!err && userData) {
                                // remove the hashed password from the object before returning
                                delete userData.hashedPassword;
                                callback(200, userData);
            
                            } else {
                                callback(404);
                            }
            
                        });
                    } else {
                        callback(403, {'Error': 'Token is not valid.'});
                    }
                });
            } else {
                callback(403, {'Error': 'Missing Token.'});
            }      

        } else {
            callback(400, {'Error': 'Missing required field.'});
        }
    }

    // Users - put
    // Required: phone
    // Optional: everything else (but atleast one must be provided)
    function updateUser(data, callback) {

        // validate
        var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;  

        // optional fields
        var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
        var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim(): false;
        var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

        if (phone) {
            // Get the token from the headers
            let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            if (tokenId) {

                utils.verifyToken(tokenId, phone, function(isValid) {
                    if (isValid) {    
   
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
     
                    } else{
                        callback(403, {'Error': 'Token is not valid.'});
                    }
                });
    
            } else {
                callback(403, {'Error': 'Missing Token.'});
            }

        } else {
            callback(400, {'Error': 'Missing required field.'});
        }

    }

    // users - delete
    // Required: phone
    // Optional: none
    function deleteUser(data, callback) {

        // validate
        var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

        if (phone) {

            // Get the token from the headers
            let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            if (tokenId) {

                utils.verifyToken(tokenId, phone, function(isValid) {

                    if (isValid) {   

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
                        callback(404, {'Error': 'Token is not valid.'})
                    } 
                });
            } else {
                callback(404, {'Error': 'Missing token.'})
            }   

        } else {
            callback(400, {'Error': 'Missing required field.'});
        }
    }
})();


module.exports = users;