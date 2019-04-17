/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const startAction = require('../actions/startAction');

exports.command = 'start';
exports.aliases = [];

exports.describe = 'Start the api server';

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

exports.handler = async (argv) => {
    commandUtils.validateDirectory();

    const environement = argv.env;
    const monitoringEnabled = argv.monitoring;

    startAction(environement, monitoringEnabled);
};
