
var helpers = require('../lib/helpers');
var assert = require('assert');

var unit = (function() {

    var tests = {};

    tests['helpers.getANumber should return 1'] = function(done) {

        var val = helpers.getANumber();
        assert.equal(val, 1);
        done();
    };

    /*tests['helpers.getANumber should return 2'] = function(done) {

        var val = helpers.getANumber();
        assert.equal(val, 2);
        done();
    };*/

    var publicAPI = {
        tests,
    };

    return publicAPI;

})();

module.exports = unit;