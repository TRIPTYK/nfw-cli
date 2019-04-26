/**
 * @module generateFromDatabaseCommand
 * @description Handle generating entity from database
 * @author Deflorenne Amaury
 */

// node modules imports
const chalk = require('chalk');

// project imports
const commandUtils = require('./commandUtils');
const inquirer = require('../utils/inquirer');
const Log = require('../utils/log');

const generateFromDatabaseAction = require('../actions/generateFromDatabaseAction');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'import';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['imp'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generate all the files from existing tables in the database';

/**
 * Yargs command builder
 */
exports.builder = () => {
};

/**
 * Main function
 * @return {Promise<void>}
 */
exports.handler = async () => {
    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();

    const {confirmation} = await inquirer.askForConfirmation(`${chalk.bgYellow(chalk.black('Warning :'))} generate model from the database will override existing models with the same name ! Do you want to continue ?`);

    if (confirmation) {
        await generateFromDatabaseAction()
            .then(() => {
                Log.success('Generated from database successfully');
            })
            .catch((e) => {
                Log.error(e.message);
            });
    } else {
        console.log(chalk.bgRed(chalk.black('/!\\ Process Aborted /!\\')));
        process.exit(0);
    }

    process.exit(0);
};
