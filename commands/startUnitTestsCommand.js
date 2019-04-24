/**
 * @module startUnitTestsCommand
 * @description Command module to handle unit test execution
 * @author Deflorenne Amaury
 */

// Project imports
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const startUnitTestsAction = require('../actions/startUnitTestsAction');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'test';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['t'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Executes unit tests';

/**
 * Yargs command builder
 * @param yargs
 */
exports.builder = (yargs) => {
    yargs.option('logs', {
        desc: "Show the full output",
        type: 'boolean',
        default: false
    });
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const fullLog = argv.logs;

    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();
    startUnitTestsAction(fullLog);
};
