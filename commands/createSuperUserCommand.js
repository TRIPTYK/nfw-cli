/**
 * node modules imports
 */
const chalk = require('chalk');
const fs = require('fs');

/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const Log = require('../utils/log');
const sqlAdaptor = require('../database/sqlAdaptator');

exports.command = 'createSU <username>';
exports.aliases = ['csu'];

exports.describe = 'Create a Super User and save the credentials in a file';

exports.builder = () => {
};

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

    fs.writeFileSync('credentials.json', JSON.stringify({
        login: credentials.login,
        password: credentials.password
    }, null, 2));

    console.log(
        chalk.bgYellow(chalk.black('/!\\ WARNING /!\\ :')) +
        "\nYou have generated a Super User for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsability to change this password to your own password"
    );

    Log.info(`Created ${credentialsFileName}`);

    process.exit(0);
};
