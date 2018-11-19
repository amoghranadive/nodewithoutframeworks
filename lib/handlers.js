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
    }

    return publicAPI;

    /**
     * HTML handlers
     */
    function indexHandler(data, callback) {
        
        // reject any request that isnt a GET
        if (data.method == 'GET') {


            let templateData = {
                'head.title': 'Check it out!',
                'head.description': 'This is meta description',
                'body.title': 'Hello templated World!',
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