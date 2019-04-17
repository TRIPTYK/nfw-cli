/**
 * node modules imports
 */
const chalk = require('chalk');

/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const inquirer = require('../utils/inquirer');

const generateFromDatabaseAction = require('../actions/generateFromDatabaseAction');

exports.command = 'import';
exports.aliases = ['imp'];

exports.describe = 'Generate all the files from existing tables in the database';

exports.builder = () => {
};

exports.handler = async () => {
    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();

    var confirm = await inquirer.askForConfirmation(`${chalk.bgYellow(chalk.black('Warning :'))} generate model from the database will override existing models with the same name ! Do you want to continue ?`);
    if (confirm.confirmation) {
        await generateFromDatabaseAction();
    } else {
        console.log(chalk.bgRed(chalk.black('/!\\ Process Aborted /!\\')));
        process.exit(0);
    }

    process.exit(0);
};
