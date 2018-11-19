
const filesys = require('../data');

var utils = (function() {
    
    var publicAPI = {
        verifyToken
    };

    return publicAPI;

    // Verify if a given token ID is valid for a given user
    function verifyToken(tokenId, phone, callback) {

        // Lookup the token
        filesys.read('tokens', tokenId, function(err, tokenData) {

            if (!err) {

                if (tokenData.phone === phone && tokenData.expires > Date.now()) {
                    callback(true);
                } else {
                    callback(false);
                }
            } else {
                callback(false);
            }
        });
    }

})();

module.exports = utils;