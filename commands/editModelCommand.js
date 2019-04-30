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
const {columnExist,format} = require('../actions/lib/utils')

//Node Modules
const {Spinner} = require('clui');
const chalk = require('chalk');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'editModel <model> <action> [columnName]';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ["em", "edit"];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'add or remove column in an existing model\nAction can be either add or remove\ncolumnName is required only for the remove action.';

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
    let {model, columnName, action} = argv;
    model= format(model);
    const spinner = new Spinner("Generating and executing migration");
    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();

    if (!utils.modelFileExists(model)) {
        Log.error("Model should exist in order to edit him :)");
        process.exit(0);
    }

    if (action === 'remove' && !columnName) {
        Log.info("you must specify the column to remove");
    } else if (action === 'add') {
        if(columnName && columnExist(model,columnName)){
            Log.error('column already exist');
            process.exit(0);
        }
        await editModelAction('add', model,columnName)
            .then(async () =>{
                spinner.start();
                await migrate(`remove-${columnName}-from-${model}`)
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
    } else if (action === 'remove' && columnName) {
        await editModelAction('remove', model, columnName)
            .then(async () => {
                spinner.start();
                await migrate(`remove-${columnName}-from-${model}`)
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