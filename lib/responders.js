
var responders = (function() {

    var publicAPI = {
        help,
        exit,
    };

    return publicAPI;

    function help() {
        console.log('help is on the way!');
    }

    function exit() {
        process.exit(0);
    }

})();

module.exports = responders;