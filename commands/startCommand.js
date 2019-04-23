/**
 * @module startCommand
 * @description Command module to handle server start and monitoring
 * @author Deflorenne Amaury
 */

// Project imports
const commandUtils = require('./commandUtils');
const startAction = require('../actions/startAction');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'start';

/**
 * Yargs command aliases
 * @type {Array}
 */
exports.aliases = [];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Start the api server';

/**
 * Yargs command builder
 * @param yargs
 */
exports.builder = (yargs) => {
    yargs.option('env', {
        desc: "Specify the environement type",
        type: "string",
        default: "development"
    });
    yargs.option('monitoring', {
        desc: "Launch monitoring websockets server",
        type: "boolean",
        default: false
    });
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    commandUtils.validateDirectory();

    const environement = argv.env;
    const monitoringEnabled = argv.monitoring;

    startAction(environement, monitoringEnabled);
};
