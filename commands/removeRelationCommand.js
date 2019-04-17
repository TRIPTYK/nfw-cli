/**
 * node modules imports
 */


/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const removeRelationAction = require('../actions/removeRelationAction');

exports.command = 'removeRelation <model1> <model2>';
exports.aliases = ['rr', 'rmRl'];

exports.describe = 'Remove a relation between two table';

exports.builder = () => {
};

exports.handler = async (argv) => {
    const {model1, model2} = argv;

    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();
    removeRelationAction(model1, model2);
};
