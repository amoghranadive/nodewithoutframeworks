
const filesys = require('../data');
const helpers = require('../helpers');
const config = require('../config');
const utils = require('./utils');

var checks = (function() {

    var publicAPI = {
        POST: createCheck,
        GET: getCheck,
        PUT: updateCheck,
        DELETE: deleteCheck,
    };

    return publicAPI;

    // Required: protocol, url, method, successcodes, timeoutseconds
    // Optional: none
    function createCheck(data, callback) {

        // validate
        var protocol = typeof(data.payload.protocol) == 'string' 
                        && ['http', 'https'].indexOf(data.payload.protocol.trim()) != -1 ? data.payload.protocol.trim() : false;

        var url = typeof(data.payload.url) == 'string' 
                    && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;

        var method = typeof(data.payload.method) == 'string' 
                        && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false;

        var successCodes = typeof(data.payload.successCodes) == 'object' 
                            && data.payload.successCodes instanceof Array 
                            && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
        
        var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' 
                                && data.payload.timeoutSeconds % 1 === 0
                                && data.payload.timeoutSeconds >= 1
                                && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

        if (protocol && url && method && successCodes && timeoutSeconds) {

            let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            if (tokenId) {

                filesys.read('tokens', tokenId, function(err, tokenData) {
                    if (!err && tokenData) {

                        if (tokenData.expires > Date.now()) {

                            let phone = tokenData.phone;

                            filesys.read('users', phone, function(err, userData) {
                                if (!err && userData) {

                                   let userChecks = typeof(userData.checks) == 'object'
                                                        && userData.checks instanceof Array ? userData.checks : [];

                                    if (userChecks.length < config.maxChecksAllowed) {

                                        let checkId = helpers.createRandomString(20);

                                        let checkObj = {
                                            id: checkId,
                                            phone,
                                            protocol,
                                            url,
                                            method,
                                            successCodes,
                                            timeoutSeconds
                                        }
                                        
                                        filesys.create('checks', checkId, checkObj, function(err) {
                                            if (!err) {

                                                userData.checks = userChecks;
                                                userData.checks.push(checkId);

                                                filesys.update('users', phone, userData, function(err) {
                                                    if (!err) {
                                                        callback(200, checkObj);
                                                    } else {
                                                        callback(500, {'Error': 'Could not update the user with the new check.'})
                                                    }
                                                })

                                            } else {
                                                callback(500, {'Error': 'Could not create the new check.'});
                                            }
                                        })

                                    } else {
                                        callback(400, {'Error': 'Exceeds max number of checks allowed per user.'});
                                    }

                                } else {
                                    callback(403, {'Error': 'User does not exist for the passed token.'});
                                }
                            });

                        } else {
                            callback(403, {'Error': 'Token has expired.'});
                        }
                    } else {
                        callback(403, {'Error': 'Token does not exist.'});
                    }
                });
                
            } else {
                callback(403, {'Error': 'Missing Token.'});
            }

        } else {
            callback(400, {'Error': 'Missing required inputs or inputs are invalid.'});
        }

    }

    // required: checkId
    // optional: none
    function getCheck(data, callback) {
       // validate
       var checkId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

       if (checkId) {

            filesys.read('checks', checkId, function(err, checkData) {

                if (!err && checkData) {

                    let phone = checkData.phone;

                    // Get the token from the headers
                    let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                    if (tokenId) {

                        utils.verifyToken(tokenId, phone, function(isValid) {
                            if (isValid) {
                                callback(200, checkData);
                            } else {
                                callback(403, {'Error': 'Token is not valid.'});
                            }
                        });
                    } else {
                        callback(403, {'Error': 'Missing Token.'});
                    }               

                } else {
                    callback(404, {'Error': 'Check does not exist.'});
                }

            });

       } else {
           callback(400, {'Error': 'Missing required field.'});
       }
    }

    // Required: checkId
    // Optional: protocol, url, method, successCodes, timeoutSeconds
    function updateCheck(data, callback) {

        // validate
        var checkId = typeof(data.payload.id) == 'string'
                         && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

        var protocol = typeof(data.payload.protocol) == 'string' 
                        && ['http', 'https'].indexOf(data.payload.protocol.trim()) != -1 ? data.payload.protocol.trim() : false;

        var url = typeof(data.payload.url) == 'string' 
                    && data.payload.url.trim().length > 0 ? data.payload.url.trim() : false;

        var method = typeof(data.payload.method) == 'string' 
                        && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method.trim()) > -1 ? data.payload.method.trim() : false;

        var successCodes = typeof(data.payload.successCodes) == 'object' 
                            && data.payload.successCodes instanceof Array 
                            && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
        
        var timeoutSeconds = typeof(data.payload.timeoutSeconds) == 'number' 
                                && data.payload.timeoutSeconds % 1 === 0
                                && data.payload.timeoutSeconds >= 1
                                && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

        
        if (checkId) {

            if (protocol || url || method || successCodes || timeoutSeconds) {

                filesys.read('checks', checkId, function(err, checkData) {

                    if (!err && checkData) {
    
                        let phone = checkData.phone;
    
                        // Get the token from the headers
                        let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                        if (tokenId) {
    
                            utils.verifyToken(tokenId, phone, function(isValid) {
                                if (isValid) {

                                    if (protocol) {
                                        checkData.protocol = protocol;
                                    }
                                    if (url) {
                                        checkData.url = url;
                                    }
                                    if (method) {
                                        checkData.method = method;
                                    }
                                    if (successCodes) {
                                        checkData.successCodes = successCodes;
                                    }
                                    if (timeoutSeconds) {
                                        checkData.timeoutSeconds = timeoutSeconds;
                                    }

                                    filesys.update('checks', checkId, checkData, function(err) {
                                        if (!err) {
                                            callback(200);
                                        } else {
                                            callback(500, {'Error': 'Failed to update check.'});
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
                        callback(404, {'Error': 'Check does not exist.'});
                    }
    
                });

            } else {
                callback(400, {'Error': 'Missing required fields.'});
            }                          

        } else {
            callback(400, {'Error': 'Missing required field.'});
        }

    }

    function deleteCheck(data, callback) {

        // validate
        var checkId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

        if (checkId) {

            filesys.read('checks', checkId, function(err, checkData) {

                if (!err && checkData) {

                    let phone = checkData.phone;
    
                    // Get the token from the headers
                    let tokenId = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                    if (tokenId) {

                        utils.verifyToken(tokenId, phone, function(isValid) {
                            if (isValid) {

                                filesys.delete('checks', checkId, function(err) {
                                    if (!err) {

                                        filesys.read('users', phone, function(err, userData) {
                                            if (!err && userData) {

                                                let userChecks = typeof(userData.checks) == 'object'
                                                                     && userData.checks instanceof Array 
                                                                     && userData.checks.indexOf(checkId) != -1 ? userData.checks : [];
                                                
                                                if (userChecks) {
                                                    
                                                    let pos = userChecks.indexOf(checkId);
                                                    userChecks.splice(pos, 1);
                                                    userData.checks = userChecks;

                                                    filesys.update('users', phone, userData, function(err) {
                                                        if (!err) {
                                                            callback(200);    
                                                        } else {
                                                            callback(500, {'Error': 'Failed to remove the check from user.'})
                                                        }
                                                    });

                                                } else {
                                                    callback(500, {'Error': 'COuld not find the reference to this check for the user.'});
                                                }                                                

                                            } else {
                                                callback(500, {'Error': 'COuld not find the user who created the check.'});
                                            }
                                        });

                                    } else {
                                        callback(500, {'Error': 'Failed to delete check.'})
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
                    callback(400, {'Error': 'Check does not exist.'});
                }
            });

        } else {
            callback(400, {'Error': 'Missing required field.'})
        }
    }
})();


module.exports = checks;