/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const deleteAction = require('../actions/deleteAction');

exports.command = 'delete <modelName>';
exports.aliases = ['del', 'D'];

exports.describe = 'Delete a model';

exports.builder = (yargs) => {
    yargs.option({
        DROP: {
            type: 'boolean',
            default: false
        }
    })
};

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
