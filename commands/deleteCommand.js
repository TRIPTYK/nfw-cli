/**
 * @module deleteCommand
 * @description Command module to handle entity deletion
 * @author Deflorenne Amaury
 */

// Project imports
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const deleteAction = require('../actions/deleteAction');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'delete <modelName>';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['del', 'D'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Delete a model';

/**
 * Yargs command builder
 * @param yargs
 */
exports.builder = (yargs) => {
    yargs.option({
        DROP: {
            type: 'boolean',
            default: false
        }
    })
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const {modelName} = argv;

    commandUtils.validateDirectory();

    if (argv.DROP) await sqlAdaptor.checkConnexion();

    // TODO : move all error handling messages to this level
    await deleteAction(modelName, argv.DROP)
        .then(() => {
            Log.success("Deleted files successfully");
        })
        .catch((e) => { // catch unhandled errors
            Log.error(`Failed to delete ${modelName} : ${e.message}`);
        });

    process.exit();
};
