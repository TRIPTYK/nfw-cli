/**
 * @module migrateCommmand
 * @description Command module to execute migration of a model
 * @author Deflorenne Amaury
 */

// Node modules
const reservedWords = require('reserved-words');
const {Spinner} = require('clui');
const chalk = require('chalk');

// Project imports
const commandUtils = require('./commandUtils');
const Log = require('../utils/log');
const migrateAction = require('../actions/migrateAction');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'migrate  <migrateName>';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ["mig", "M"];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generate, compile and run the migration';

/**
 * Yargs command builder
 */
exports.builder = () => {

};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const modelName = argv.migrateName;
    const spinner = new Spinner("Generating and executing migration");

    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();

    const regex = /(?:^|(?<= ))[a-zA-Z0-9]+(?= |$)/; // alphanumeric check

    if (!modelName.match(regex)) {
        console.log(`Migration name can be only alphanumeric caracters`);
        process.exit(0);
    }

    if (await reservedWords.check(modelName, 6)) {
        console.log(`${modelName} is a reserved word`);
        process.exit(0);
    }

    spinner.start();

    await migrateAction(modelName)
        .then((generated) => {
            const [migrationDir] = generated;
            spinner.stop(true);
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            spinner.stop(true);
            Log.error(e.message);
        });

    process.exit(0);
};
