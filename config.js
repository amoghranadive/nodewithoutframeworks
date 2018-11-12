/**
 *  Create and export configuration variables. 
 */

// Container for all the environments
var environments = {};

// Staging (default) environment
environments.STAGING = {
    'port': 3000,
    'envName': 'STAGING'
};

// Production environment
environments.PRODUCTION = {
    'port': 5000,
    'envName': 'PRODUCTION'
};

// determine which env was passed
var currentEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toUpperCase().trim() : '';

var envToExport = typeof(environments[currentEnv]) !== 'undefined' ? environments[currentEnv] : environments.STAGING;

// export the module
module.exports = envToExport;