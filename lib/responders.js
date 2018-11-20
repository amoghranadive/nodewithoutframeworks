
var responders = (function() {

    var publicAPI = {
        help,
        exit,
        stats,
        listUsers,
        moreUserInfo,
        listChecks,
        moreCheckInfo,
        listLogs,
        moreLogInfo
    };

    return publicAPI;

    function help() {
        console.log('help is on the way!');
    }

    function exit() {
        process.exit(0);
    }

    function stats() {

    }

    function listUsers() {

    }

    function moreUserInfo(str) {

    }

    function listChecks(str) {

    }

    function moreCheckInfo(str) {

    }

    function listLogs(str) {

    }

    function moreLogInfo(str) {

    }
    
})();

module.exports = responders;