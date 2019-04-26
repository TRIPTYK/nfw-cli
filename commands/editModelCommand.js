/**
 * @module editModelCommand
 * @description Command module to handle editing of a given entity
 * @author Deflorenne Amaury
 */

// Project imports
const commandUtils = require('./commandUtils');
const utils = require('../actions/lib/utils');
const editModelAction = require('../actions/editModelAction');
const Log = require('../utils/log');
const migrate = require('../actions/migrateAction');

//Node Modules
const {Spinner} = require('clui');
const chalk = require('chalk');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'editModel <model> <action> [column]';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ["em", "edit"];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'add or remove column in a model';

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
    const {model, column, action} = argv;
    const spinner = new Spinner("Generating and executing migration");
    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();

    if (!utils.modelFileExists(model)) {
        Log.error("Model should exist in order to edit him :)");
        process.exit(0);
    }

    if (action === 'remove' && !column) {
        Log.info("you must specify the column to remove");
    } else if (action === 'add') {
        await editModelAction('add', model)
            .then(async () =>{
                spinner.start();
                await migrate(`remove-${column}-from-${model}`)
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
            })
            .catch((e) => {
                Log.error('Failed to edit model : ' + e.message)
            });
    } else if (action === 'remove' && column) {
        await editModelAction('remove', model, column)
            .then(async () => {
                spinner.start();
                await migrate(`remove-${column}-from-${model}`)
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
            })
            .catch((e) => {
                Log.error('Failed to edit model : ' + e.message)
            })
    } else Log.info("action must be add or remove");


    process.exit(0);
};