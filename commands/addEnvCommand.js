/**
 * @module addEnvCommand
 * @description  Command module for creating a new environment file
 * @author Deflorenne Amaury
 */

// Node modules
const fs = require('fs');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Project modules
const editEnvAction = require('../actions/editEnvAction');
const commandUtils = require('./commandUtils');
const Log = require('../utils/log');

/**
 * Yargs command syntax
 * @type {string}
 */
exports.command = 'addENV <env>';

/**
 * Yargs command alias
 * @type {string[]}
 */
exports.aliases = ["ae", "addE"];

/**
 * Command description
 * @type {string}
 */
exports.describe = 'Generate a new environement based on asked question';

/**
 * Yargs builder
 */
exports.builder = () => {

};

/**
 * @description Main command handler
 * @param argv
 * @returns {Promise<void>}
 */
exports.handler = async (argv) => {
    const env = argv.env;

    commandUtils.validateDirectory();

    console.log(chalk.blue('The default choices are based on the default environement setting -> developement.env'));

    let chosenOne = dotenv.parse(fs.readFileSync(`development.env`));

    await editEnvAction(env, chosenOne)
        .then((written) => {
            const [envFile] = written;
            Log.success(`New environment generated successfully`);
            Log.info(`Created ${chalk.cyan(envFile)}`);
        })
        .catch((e) => {
            Log.error("Failed to generate new environment : " + e.message);
        });
};