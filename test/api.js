
var app = require('./../index');
var assert = require('assert');
var http = require('http');
var config = require('./../lib/config');

var api = (function() {

    var tests = {};

    var publicAPI = {
        tests,
    };

    tests['app.init should start without throwing'] = function(done) {
        assert.doesNotThrow(function() {
            app.init(function(err) {
                done();
            })
        }, TypeError);
    };

    tests['/ping should respond to GET with 200'] = function(done) {
        makeGetRequest('/ping/', function(res) {
            console.log('TESTING');
            assert.equal(res.statusCode, 200);
            done();
        });
    };

    tests['/api/users should respond to GET with 400'] = function(done) {
        makeGetRequest('/api/users/', function(res) {
            assert.equal(res.statusCode, 400);
            done();
        });
    };

    tests['/api/doIExist should respond to GET with 404'] = function(done) {
        makeGetRequest('/api/doIExist', function(res) {
            assert.equal(res.statusCode, 404);
            done();
        });
    };

    return publicAPI;

    function makeGetRequest(path, callback) {

        var requestDetails = {
            'protocol': 'http:',
            'hostname': 'localhost',
            'port': config.httpPort,
            'method': 'GET',
            'path': path,
            'headers': {
                'Content-Type': 'application/json'
            }
        };
        
        var req = http.request(requestDetails, function(res) {
            callback(res);
        });

        req.end();
    }

})();

module.exports = api;