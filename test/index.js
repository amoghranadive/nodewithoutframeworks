/**
 * Test runner
 */

 var unitTests = require('./unit');
 
 // Application logic for the test runner
var testRunner = (function() {
     
    var publicAPI = {
        runTests,
    };

    function runTests() {
        var errors = [];
        var success = 0;
        var limit = countTests();
        var counter = 0;

        for (let key in unitTests) {
            if (unitTests.hasOwnProperty(key)) {
                let subTests = unitTests[key];
                for (let testName in subTests) {
                    if (subTests.hasOwnProperty(testName)) {
                        try {
                            testValue = subTests[testName];
                            testValue(function() {
                                console.log('\x1b[32m%s\x1b[0m', testName);
                                counter++;
                                success++;
                                if (counter == limit) {
                                    produceTestReport(limit, success, errors);
                                }
                            })
                        }
                        catch (e) {
                            errors.push({
                                'name': testName,
                                'error': e
                            });
                            console.log('\x1b[31m%s\x1b[0m', testName);
                            counter++;
                            if (counter == limit) {
                                produceTestReport(limit, success, errors);
                            }
                        }
                    }
                }
            }
        }
    }


    function countTests() {
        var counter = 0;
        for (let key in unitTests) {
            if (unitTests.hasOwnProperty(key)) {
                let subTests = unitTests[key];
                for (let testName in subTests) {
                    if (subTests.hasOwnProperty(testName)) {
                        counter++;
                    }
                }
            }
        }
        return counter;
    }


    function produceTestReport(limit,successes,errors) {

        console.log("");
        console.log("--------BEGIN TEST REPORT--------");
        console.log("");
        console.log("Total Tests: ",limit);
        console.log("Pass: ",successes);
        console.log("Fail: ",errors.length);
        console.log("");

        // If there are errors, print them in detail
        if (errors.length > 0) {

            console.log("--------BEGIN ERROR DETAILS--------");
            console.log("");
            
            errors.forEach(function(testError) {
                console.log('\x1b[31m%s\x1b[0m',testError.name);
                console.log(testError.error);
                console.log("");
            });

            console.log("");
            console.log("--------END ERROR DETAILS--------");
        }

        console.log("");
        console.log("--------END TEST REPORT--------");
    }

    return publicAPI;

})();


testRunner.runTests();

