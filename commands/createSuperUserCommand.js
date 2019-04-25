/**
 * @module createSuperUserCommand
 * @description Creates a super user in the boilerplate database
 * @author Deflorenne Amaury
 */

//Node modules imports
const chalk = require('chalk');
const fs = require('fs');
const ejs = require('ejs');

// Project imports
const commandUtils = require('./commandUtils');
const Log = require('../utils/log');
const sqlAdaptor = require('../database/sqlAdaptator');

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
    const credentialsFileName = 'credentials.json';

    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();

    let credentials = await sqlAdaptor.insertAdmin(username)
        .catch((e) => {
            Log.error("Failed to insert admin : " + e.message);
            process.exit();
        });

    const credentialsTemplate = `${process.cwd()}/templates/custom/userCredentials.ejs`;

    const compiled = ejs.compile(credentialsTemplate)({
        login: credentials.login,
        password: credentials.password
    });

    fs.writeFileSync('credentials.json', compiled);

    console.log(
        chalk.bgYellow(chalk.black('/!\\ WARNING /!\\ :')) +
        "\nYou have generated a Super User for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsibility to change this password to your own password"
    );

    Log.info(`Created ${credentialsFileName}`);

    process.exit(0);
};
