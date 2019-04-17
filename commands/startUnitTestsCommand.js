/**
 * node modules imports
 */


/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const startUnitTestsAction = require('../actions/startUnitTestsAction');

exports.command = 'test';
exports.aliases = ['t'];

exports.describe = 'Executes unit tests';


exports.builder = (yargs) => {
    yargs.option('logs', {
        desc: "Show the full output",
        type: 'boolean',
        default: false
    });
};

exports.handler = async (argv) => {
    const fullLog = argv.logs;

    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();
    startUnitTestsAction(fullLog);
};
