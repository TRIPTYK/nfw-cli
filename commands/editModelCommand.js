/**
 * node modules imports
 */

/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const utils = require('../actions/lib/utils');
const sqlAdaptor = require('../database/sqlAdaptator');
const editModelAction = require('../actions/editModelAction');
const Log = require('../utils/log');

exports.command = 'editModel <model> <action> [column]';
exports.aliases = ["em", "edit"];

exports.describe = 'add or remove column in a model';

exports.builder = () => {

};

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
    }
    else Log.info("action must be add or remove");
};