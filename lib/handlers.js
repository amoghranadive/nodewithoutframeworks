/**
 * Request handlers
 */

 const users = require('./api/users');
 const tokens = require('./api/tokens');
 const checks = require('./api/checks');
 const helpers = require('./helpers');

 // define handlers
var handlers = (function()  {

    const acceptableMethods = ['POST', 'GET', 'PUT', 'DELETE'];

    var publicAPI = {
        index: indexHandler,
        notFound: defaultHandler,
        ping: pingHandler,
        userHandler,
        tokenHandler,
        checksHandler,
        faviconHandler,
        publicHandler,
        accountCreateHandler,
        loginHandler,
        logoutHandler,
        accountEditHandler,
        accountDeleteHandler,
        checkCreateHandler,
    }

    return publicAPI;

    /**
     * HTML handlers
     */
    function indexHandler(data, callback) {
        
        // reject any request that isnt a GET
        if (data.method == 'GET') {


            let templateData = {
                'head.title': 'Uptime monitoring made simple!',
                'head.description': 'Free, simple monitoring for http, https.',
                'body.class': 'index',
            };

            helpers.getTemplate('index', templateData, function(err, str) {
                if (!err && str) {

                    helpers.addUniversalTemplates(str, templateData, function(err, fullString) {

                        if (!err && fullString) {
                            callback(200, fullString, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });                    
                    
                } else {
                    callback(500, undefined, 'html');
                }
            });

        } else {
            callback(405, undefined, 'html');
        }
    }

    function accountCreateHandler(data, callback) {
        
        // reject any request that isnt a GET
        if (data.method == 'GET') {


            let templateData = {
                'head.title': 'Create an account',
                'head.description': 'Signup is easy and only takes a few seconds.',
                'body.class': 'accountCreate',
            };

            helpers.getTemplate('accountCreate', templateData, function(err, str) {
                if (!err && str) {

                    helpers.addUniversalTemplates(str, templateData, function(err, fullString) {

                        if (!err && fullString) {
                            callback(200, fullString, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });                    
                    
                } else {
                    callback(500, undefined, 'html');
                }
            });

        } else {
            callback(405, undefined, 'html');
        }
    }


    function loginHandler(data, callback) {

        // reject any request that isnt a GET
        if (data.method == 'GET') {

            let templateData = {
                'head.title': 'Login to your account',
                'head.description': 'Please enter your phone number and password to access your account.',
                'body.class': 'sessionCreate',
            };

            helpers.getTemplate('sessionCreate', templateData, function(err, str) {

                if (!err && str) {

                    helpers.addUniversalTemplates(str, templateData, function(err, fullString) {

                        if (!err && fullString) {
                            callback(200, fullString, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });                    
                    
                } else {
                    callback(500, undefined, 'html');
                }
            });

        } else {
            callback(405, undefined, 'html');
        }
    }


    function logoutHandler(data, callback) {

        // reject any request that isnt a GET
        if (data.method == 'GET') {

            let templateData = {
                'head.title': 'Logged out',
                'head.description': 'You have been logged out of your account.',
                'body.class': 'sessionDeleted',
            };

            helpers.getTemplate('sessionDeleted', templateData, function(err, str) {

                if (!err && str) {

                    helpers.addUniversalTemplates(str, templateData, function(err, fullString) {

                        if (!err && fullString) {
                            callback(200, fullString, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });                    
                    
                } else {
                    callback(500, undefined, 'html');
                }
            });

        } else {
            callback(405, undefined, 'html');
        }
    }


    function accountEditHandler(data, callback) {

        // reject any request that isnt a GET
        if (data.method == 'GET') {

            let templateData = {
                'head.title': 'Account Settings',
                'body.class': 'accountEdit',
            };

            helpers.getTemplate('accountEdit', templateData, function(err, str) {

                if (!err && str) {

                    helpers.addUniversalTemplates(str, templateData, function(err, fullString) {

                        if (!err && fullString) {
                            callback(200, fullString, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });                    
                    
                } else {
                    callback(500, undefined, 'html');
                }
            });

        } else {
            callback(405, undefined, 'html');
        }   
    }


    function accountDeleteHandler(data, callback) {

        // reject any request that isnt a GET
        if (data.method == 'GET') {

            let templateData = {
                'head.title': 'Account Deleted',
                'head.description': 'Your account has been deleted.',
                'body.class': 'accountDeleted',
            };

            helpers.getTemplate('accountDeleted', templateData, function(err, str) {

                if (!err && str) {

                    helpers.addUniversalTemplates(str, templateData, function(err, fullString) {

                        if (!err && fullString) {
                            callback(200, fullString, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });                    
                    
                } else {
                    callback(500, undefined, 'html');
                }
            });

        } else {
            callback(405, undefined, 'html');
        }   
    }


    function checkCreateHandler(data, callback) {

        // reject any request that isnt a GET
        if (data.method == 'GET') {

            let templateData = {
                'head.title': 'Create a Check',
                'body.class': 'checksCreate',
            };

            helpers.getTemplate('checksCreate', templateData, function(err, str) {

                if (!err && str) {

                    helpers.addUniversalTemplates(str, templateData, function(err, fullString) {

                        if (!err && fullString) {
                            callback(200, fullString, 'html');
                        } else {
                            callback(500, undefined, 'html');
                        }
                    });                    
                    
                } else {
                    callback(500, undefined, 'html');
                }
            });

        } else {
            callback(405, undefined, 'html');
        }   
    }



    function faviconHandler(data, callback) {
        
        if (data.method == 'GET') {

            helpers.getStaticAsset('favicon.ico', function(err, data) {

                if (!err && data) {
                    callback(200, data, 'favicon');
                } else {
                    callback(500);
                }
            })

        } else {
            callback(405);
        }
    }


    function publicHandler(data, callback) {
     
        if (data.method == 'GET') {

            // get the filename being requested
            let trimmedAssetName = data.trimmedPath.replace('public/', '').trim();

            helpers.getStaticAsset(trimmedAssetName, function(err, data) {

                if (!err && data) {

                    // Determine the content type, default to plain text
                    let contentType = 'plain';

                    if (trimmedAssetName.indexOf('css') != -1) {
                        contentType = 'css';
                    } else if (trimmedAssetName.indexOf('png') != -1) {
                        contentType = 'png';
                    } else if (trimmedAssetName.indexOf('jpg') != -1) {
                        contentType = 'jpg';
                    } else if (trimmedAssetName.indexOf('ico') != -1) {
                        contentType = 'ico';
                    }

                    callback(200, data, contentType);

                } else {
                    callback(404);
                }
            })

        } else {
            callback(405);
        }
    }


    /**
     * API Handlers
     */
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

    function checksHandler(data, callback) {
   
        if (acceptableMethods.indexOf[data.method] != -1) {
            checks[data.method](data,callback);
        } else {
            callback(405);
        }
    }

})();

module.exports = handlers;