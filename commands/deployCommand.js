/**
 * @module deployCommand
 * @description Command module to handle project deploy
 * @author Deflorenne Amaury
 */

// Project imports
const commandUtils = require('./commandUtils');
const deployAction = require('./../actions/deployAction');
const Log = require('./../utils/log');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'deploy <env> [mode]';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['dep'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Deploy to distant server using pm2';

/**
 * Yargs command builder
 * @param yargs
 */
exports.builder = (yargs) => {
    yargs.option('createDatabase', {
        alias: 'db',
        type: 'boolean',
        description: 'Create database'
    })
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const {env,mode,createDatabase} = argv;

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();

    await deployAction(env,mode,createDatabase)
        .catch((e) => {
            Log.error(e.message);
        });

    process.exit();
};
