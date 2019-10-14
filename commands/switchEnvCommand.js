/**
 * @module switchEnv
 * @description Switch env in nfw file
 * @author Deflorenne Amaury
 */

// Project imports
const commandUtils = require('./commandUtils');
const Log = require('../utils/log');
const Utils = require('../actions/lib/utils');

// node modules
const JsonFileWriter = require('json-file-rw');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'switchEnv <env>';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['se'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Switch .nfw current env';

/**
 * Yargs command builder
 * @param {yargs} yargs
 */
exports.builder = (yargs) => {
    yargs.positional('env', {
        type: 'string',
        description: 'Environnement to switch'
    });
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    commandUtils.validateDirectory();
    await commandUtils.checkVersion();

    const { env } = argv;

    if (!Utils.getEnvFilesNames().includes(env)) {
        Log.error("This env does not exists");
        process.exit(0);
    }

    const nfwFile = new JsonFileWriter();
    nfwFile.openSync('.nfw');
    nfwFile.setNodeValue('env',env);
    nfwFile.saveSync();

    process.exit();
};
