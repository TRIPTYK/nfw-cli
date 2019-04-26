/**
 * @module createSuperUserCommand
 * @description Creates a super user in the boilerplate database
 * @author Deflorenne Amaury
 */

//Node modules imports
const chalk = require('chalk');

// Project imports
const commandUtils = require('./commandUtils');
const Log = require('../utils/log');
const createSuperUserAction = require('../actions/createSuperUserAction');

/**
 * Yargs command syntax
 * @type {string}
 */
exports.command = 'createSU <username>';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['csu'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Create a Super User and save the credentials in a file';

/**
 *  Yargs command builder
 */
exports.builder = () => {
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const username = argv.username;

    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();


    await createSuperUserAction(username)
        .then((generated) => {
            const [ filePath ] = generated;

            Log.info(`Created ${filePath}`);

            console.log(
                chalk.bgYellow(chalk.black('/!\\ WARNING /!\\ :')) +
                `\nYou have generated a Super User named ${chalk.red(username)} for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsibility to change this password to your own password`
            );
        })
        .catch((e) => {
            Log.error("Failed to create super user : " + e.message);
        });

    process.exit(0);
};
