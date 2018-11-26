/**
 *  Create and export configuration variables. 
 */

// Container for all the environments
var environments = {};

// Staging (default) environment
environments.STAGING = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName': 'STAGING',
    'hashSecret': 'ThisIsASecret',
    'maxChecksAllowed': 5,
    'twilio': {
        'accountSid': 'AC10b4464213ec7c828298a7a906f690ce',
        'authToken': 'dfe0ba3bbbb41e3abc1bb7f1f885d1ac',
        'fromPhone': '+12038750823'
    },
    'templateGlobals' : {
        'appName': 'NodeTutorial',
        'companyName': 'Amogh Labs LLC',
        'yearCreated': '2018',
        'baseUrl': 'http://localhost:3000' 
    }
};

// Production environment
environments.PRODUCTION = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'PRODUCTION',
    'hashSecret': 'ThisIsAProdSecret',
    'maxChecksAllowed': 5,
    'twilio': {
        'accountSid': 'AC10b4464213ec7c828298a7a906f690ce',
        'authToken': 'dfe0ba3bbbb41e3abc1bb7f1f885d1ac',
        'fromPhone': '+12038750823'
    },
    'templateGlobals' : {
        'appName': 'CheckitOut!',
        'companyName': 'Amogh Labs LLC',
        'yearCreated': '2018',
        'baseUrl': 'http://localhost:5000' 
    }
};

// Staging (default) environment
environments.TESTING = {
    'httpPort': 4000,
    'httpsPort': 4001,
    'envName': 'TESTING',
    'hashSecret': 'ThisIsASecret',
    'maxChecksAllowed': 5,
    'twilio': {
        'accountSid': 'AC10b4464213ec7c828298a7a906f690ce',
        'authToken': 'dfe0ba3bbbb41e3abc1bb7f1f885d1ac',
        'fromPhone': '+12038750823'
    },
    'templateGlobals' : {
        'appName': 'NodeTutorial',
        'companyName': 'Amogh Labs LLC',
        'yearCreated': '2018',
        'baseUrl': 'http://localhost:4000' 
    }
};

// determine which env was passed
var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toUpperCase().trim() : '';

var envToExport = typeof(environments[currentEnv]) !== 'undefined' ? environments[currentEnv] : environments.STAGING;

// export the module
module.exports = envToExport;