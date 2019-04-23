/**
 * Node modules
 */
const reservedWords = require('reserved-words');
const {Spinner} = require('clui');
const chalk = require('chalk');

/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const Log = require('../utils/log');
const sqlAdaptor = require('../database/sqlAdaptator');
const migrateAction = require('../actions/migrateAction');

exports.command = 'migrate  <migrateName>';
exports.aliases = ["mig", "M"];

exports.describe = 'Generate, compile and run the migration';

exports.builder = () => {

};

exports.handler = async (argv) => {
    const modelName = argv.migrateName;
    const spinner = new Spinner("Generating and executing migration");

    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();

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