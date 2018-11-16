/**
 * library for storing and editing data
 */

// dependencies
const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// container for the module
var lib = {};

// base directory
lib.baseDir = path.join(__dirname, '..', '.data');

lib.create = function createFile(dir, fileName, data, callback) {

    // try to open file for writing
    fs.open(lib.baseDir + '/' + dir + '/' + fileName + '.json', 'wx', function(err, fileDescriptor) {
        
        if (!err && fileDescriptor) {
            // convert data to a string
            let stringData = JSON.stringify(data);

            // write to file
            fs.writeFile(fileDescriptor, stringData, function(err) {
                if (!err) {
                    fs.close(fileDescriptor, function(err) {
                        if (!err) {
                            callback(false);
                        } else {
                            callback('Error closing file');            
                        }
                    })
                } else {
                    callback('Error writing to new file');
                }
            })

        } else {
            callback('Failed to create new file.');
        }
    });
};


lib.read = function readFile(dir, fileName, callback) {

    fs.readFile(lib.baseDir + '/' + dir + '/' + fileName + '.json', 'utf-8', function(err, data) {

        if (!err && data) {
            var parsedData = helpers.parseJSONToObject(data);
            callback(false, parsedData);
        } else {
            callback(err, data);
        }        
    })
};


lib.update = function updateFile(dir, fileName, data, callback) {

    // open the file for reading
    fs.open(lib.baseDir + '/' + dir + '/' + fileName + '.json', 'r+', function(err, fileDescriptor) {

        if (!err && fileDescriptor) {
            // convert data to a string
            let stringData = JSON.stringify(data);

            fs.truncate(fileDescriptor, function(err) {
                if (!err) {
                    fs.writeFile(fileDescriptor, stringData, function(err) {
                        if (!err) {
                            fs.close(fileDescriptor, function(err) {
                                if (!err) {
                                    callback(false);
                                } else {
                                    callback('Error closing file');            
                                }
                            })
                        } else {
                            callback('Error writing to new file');
                        }
                    })                   
                } else {
                    callback('Error truncating file');
                }
            });            

        } else {
            callback('Failed to open file');
        }
    });
}


lib.delete = function deleteFile(dir, fileName, callback) {

    // unlink the file
    fs.unlink(lib.baseDir + '/' + dir + '/' + fileName + '.json', function(err) {
        callback(err);
    })
};


lib.list = function listFiles(dir, callback) {

    fs.readdir(lib.baseDir + '/' + dir + '/', function(err, data) {
        if (!err) {
            if (!err && data && data.length > 0) {
                let trimmedFileNames = [];
                data.forEach(function(fileName) {
                    trimmedFileNames.push(fileName.replace('.json', ''));
                });
                callback(false, trimmedFileNames);
            }
        } else {
            callback(err, data);
        }
    })
};

module.exports = lib;