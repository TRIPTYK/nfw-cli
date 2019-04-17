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
    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();

    if (!utils.modelFileExists(argv.model)) {
        Log.error("Model should exist in order to edit him :)");
        process.exit(0);
    }

    if (argv.action === 'add') editModelAction('add', argv.model);
    else if (argv.action === 'remove' && argv.column !== undefined) editModelAction('remove', argv.model, argv.column);
    else if (argv.action === 'remove' && argv.column === undefined) Log.info("you must specify the column to remove");
    else Log.info("action must be add or remove");
};