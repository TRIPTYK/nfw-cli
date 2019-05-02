/**
 * @module startUnitTestsCommand
 * @description Command module to handle unit test execution
 * @author Deflorenne Amaury
 */

// Project imports
const commandUtils = require('./commandUtils');
const {Spinner} = require('clui');
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

};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const status = new Spinner('Executing unit tests, please wait ...');
    status.start();

    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();

    await startUnitTestsAction();

    status.stop();
    process.exit(0);
};
