/**
 * Library that demonstrates something throwing when its init is called
 * 
 */


 var debugDemo = (function() {

    var publicAPI = {
        init,
    }

    return publicAPI;

    function init() {
        var bar = foo;
    }
 })();

 module.exports = debugDemo;
