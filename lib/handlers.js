/**
 * Request handlers
 */

 const filesys = require('./data');
 const helpers = require('./helpers');

 // define handlers
var handlers = function()  {

    var executeMethod = {
        POST: handlePOST,
        GET: handleGET,
        PUT: handlePUT,
        DELETE: handleDELETE,
    };

    var publicAPI = {
        notFound: defaultHandler,
        ping: pingHandler,
        users: userHandler,
    }

    return publicAPI;

    function defaultHandler(data, callback) {
        callback(404);
    };

    function pingHandler(data, callback) {
        callback(200);
    }

    function userHandler(data, callback) {

        const acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];

        console.log(data.method);
    
        if (acceptableMethods.indexOf[data.method] != -1) {
            executeMethod[data.method](data,callback);
        } else {
            callback(405);
        }
    }

    // Users - post
    // Required: firstname, lastname, phone, password, tosagreement
    // Optional: none
    function handlePOST(data, callback) {
        
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
    function handleGET(data, callback) {

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
    function handlePUT(data, callback) {

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
    function handleDELETE(data, callback) {

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
};


module.exports = handlers();