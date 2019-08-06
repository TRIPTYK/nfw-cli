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
const utils = require('../actions/lib/utils');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'migrate <migrateName>';

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
exports.builder = (yargs) => {
    yargs.option('restore', {
        desc: "Restore migration data at a specific state",
        type: "boolean",
        default: false
    });
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const modelName = argv.migrateName;
    const restore = argv.restore;

    const spinner = new Spinner("Generating and executing migration");

    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();

    if (!utils.isAlphanumeric(modelName)) {
      console.log(`Migration name can be only alphanumeric characters`);
      process.exit(0);
    }

    if (reservedWords.check(modelName, 6)) {
        console.log(`${modelName} is a reserved word`);
        process.exit(0);
    }

    spinner.start();

    await migrateAction(modelName,restore)
        .then((generated) => {
            const [migrationDir] = generated;
            spinner.stop(true);
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            spinner.stop(true);
            console.log(e)
            Log.error(e.message);
        });

    process.exit(0);
};
