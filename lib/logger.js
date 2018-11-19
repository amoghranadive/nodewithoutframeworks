/**
 * Library for writing and managing log files
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

var logger = (function() {

    const baseDir = path.join(__dirname, '..', '.logs');

    var publicAPI = {
        append,
        list,
        compress,
        decompress,
        truncate
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


    function list(includeCompressedFiles, callback) {

        fs.readdir(baseDir, function(err, data) {

            if (!err && data && data.length > 0) {

                var trimmedFileNames = [];
                data.forEach(function(fileName) {

                    if (fileName.indexOf('.log') != -1) {
                        trimmedFileNames.push(fileName.replace('.log', ''));
                    }

                    if (fileName.indexOf('.gz.b64') != -1 && includeCompressedFiles) {
                        trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                    }
                });

                callback(false, trimmedFileNames);

            } else {
                callback(err, data);
            }
        });
    }


    function compress(logId, newLogId, callback) {

        var sourceFile = logId + '.log';
        var destFile = newLogId + '.gz.b64';

        fs.readFile(baseDir + '/' + sourceFile, 'utf-8', function(err, data) {

            if (!err && data) {

                zlib.gzip(data, function(err, buffer) {
                    if (!err && buffer) {

                        fs.open(baseDir + '/' + destFile, 'wx', function(err, fileDescriptor) {
                            if (!err && fileDescriptor) {

                                fs.writeFile(fileDescriptor, buffer.toString('base64'), function(err) {
                                    if (!err) {

                                        fs.close(fileDescriptor, function(err) {
                                            if (!err) {
                                                callback(false);
                                            } else {
                                                callback(err);
                                            }
                                        })
                                    } else {
                                        callback(err);
                                    }
                                })
                            } else{
                                callback(err);
                            }
                        });
                    } else {
                        callback(err);
                    }
                })
            } else {
                callback(err);
            }
        });
    }


    function decompress(fileId, callback) {

        var fileName = fileId + '.gz.b64';

        fs.readFile(baseDir + '/' + fileName, 'utf-8', function(err, data) {

            if (!err && data) {

                var inputBuffer = Buffer.from(data, 'base64');
                zlib.unzip(inputBuffer, function(err, outputBuffer) {

                    if (!err && outputBuffer) {
                        let str = outputBuffer.toString();
                        callback(false, str);
                    } else {
                        callback(err);
                    }
                })

            } else {
                callback(err);
            }
        });
    }


    function truncate(logId, callback) {

        var fileName = logId + '.log';

        console.log('Truncating file: ' + fileName);

        fs.truncate(baseDir + '/' + fileName, 0, function(err) {
            if (!err) {
                callback(false);
            } else {
                callback(err);
            }
        })

    }


})();

module.exports = logger;