/**
 * @module removeRelationCommand
 * @description Command module to handle removing relation between 2 models
 * @author Deflorenne Amaury
 */

// node modules
const {Spinner} = require('clui');
const chalk = require('chalk');

// project imports
const commandUtils = require('./commandUtils');
const removeRelationAction = require('../actions/removeRelationAction');
const Log = require('../utils/log');
const migrate = require('../actions/migrateAction');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'removeRelation <model1> <model2> <type>';

/**
 * Yargs aliases
 * @type {string[]}
 */
exports.aliases = ['rr', 'rmRl'];

/**
 * Yargs description
 * @type {string}
 */
exports.describe = 'Remove a relation between two table';

/**
 * Handle and build command options
 * @param yargs
 */
exports.builder = (yargs) => {
    yargs.choices('relation',['mtm','mto','otm','oto']);
};


/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const {model1, model2 , type } = argv;

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();
    await commandUtils.checkConnectToDatabase();

    await removeRelationAction(model1, model2, type)
        .then(() => {
            Log.success(`Relation removed between ${model1} and ${model2}`);
        })
        .catch((e) => {
            Log.error("Cannot remove relation : " + e.message);
        });

    const spinner = new Spinner("Generating and executing migration");
    spinner.start();
    await migrate(`${model1}-${model2}`)
        .then((generated) => {
            spinner.stop();
            const [migrationDir] = generated;
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            spinner.stop();
            Log.error(e.message);
        });

    process.exit(0);
};
