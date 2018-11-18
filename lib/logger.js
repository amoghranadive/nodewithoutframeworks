/**
 * Library for writing and managing log files
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

var logger = (function() {

    const baseDir = path.join(__dirname, '..', '.logs');

    var publicAPI = {
        append
    };

    return publicAPI;

    function append(fileName, contents, callback) {

        fs.open(baseDir + '/' + fileName + '.log', 'a', function(err, fileDescriptor) {

            if (!err && fileDescriptor) {

                fs.appendFile(fileDescriptor, contents+'\n', function(err) {
                    if (!err) {

                        fs.close(fileDescriptor, function(err) {
                            if (!err) {
                                callback(false);
                            } else {
                                callback('Error closing file that was being appended.')
                            }
                        })
                    } else {
                        callback('Error appending the file.')
                    }
                });

            } else {
                callback('Could not open file for appending.')
            }
        });
    }
})();

module.exports = logger;