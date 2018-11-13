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
    'maxChecksAllowed': 10,
};

// Production environment
environments.PRODUCTION = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName': 'PRODUCTION',
    'hashSecret': 'ThisIsAProdSecret',
    'maxChecksAllowed': 5,
};

// determine which env was passed
var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toUpperCase().trim() : '';

var envToExport = typeof(environments[currentEnv]) !== 'undefined' ? environments[currentEnv] : environments.STAGING;

// export the module
module.exports = envToExport;