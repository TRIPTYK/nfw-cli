/**
 * @module editModelCommand
 * @description Command module to handle editing of a given entity
 * @author Deflorenne Amaury
 */

// Project imports
const commandUtils = require('./commandUtils');
const utils = require('../actions/lib/utils');
const sqlAdaptor = require('../database/sqlAdaptator');
const editModelAction = require('../actions/editModelAction');
const Log = require('../utils/log');

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

    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();

    if (!utils.modelFileExists(model)) {
        Log.error("Model should exist in order to edit him :)");
        process.exit(0);
    }

    if (action === 'remove' && !column) {
        Log.info("you must specify the column to remove");
    } else if (action === 'add') {
        editModelAction('add', model)
            .catch((e) => {
                Log.error('Failed to edit model : ' + e.message)
            });
    } else if (action === 'remove' && !column) {
        editModelAction('remove', model, column)
            .catch((e) => {
                Log.error('Failed to edit model : ' + e.message)
            })
    } else Log.info("action must be add or remove");
};