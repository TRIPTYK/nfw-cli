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
    commandUtils.validateDirectory();

    if (argv.DROP) await sqlAdaptor.checkConnexion();

    deleteAction(argv.modelName, argv.DROP);
};
