/**
 * @module removeRelationCommand
 * @description Command module to handle removing relation between 2 models
 * @author Deflorenne Amaury
 */

// project imports
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const removeRelationAction = require('../actions/removeRelationAction');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'removeRelation <model1> <model2>';

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
 * Yargs builder
 */
exports.builder = () => {
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const {model1, model2} = argv;

    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();

    removeRelationAction(model1, model2);
};
