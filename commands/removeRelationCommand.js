/**
 * @module removeRelationCommand
 * @description Command module to handle removing relation between 2 models
 * @author Deflorenne Amaury
 */

// project imports
const commandUtils = require('./commandUtils');
const removeRelationAction = require('../actions/removeRelationAction');
const Log = require('../utils/log');
const {format} = require('../actions/lib/utils');
const {singular} = require('pluralize');

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
 * Handle and build command options
 * @param yargs
 */
exports.builder = (yargs) => {
    yargs.option('m1Name', {
        desc: "Specify the name of the column for the first model",
        type: "string",
        default: null
    });
    yargs.option('m2Name', {
        desc: "Specify the name of the column for the second model",
        type: "string",
        default: null
    });
};


/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const {model1, model2} = argv;
    let m1Name = argv.m1Name ? singular(format(argv.m1Name)) : model1;
    let m2Name = argv.m2Name ? singular(format(argv.m2Name)) : model2;
    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();

    await removeRelationAction(model1, model2,m1Name,m2Name)
        .then(() => {
            Log.success(`Relation removed between ${model1} and ${model2}`);
        })
        .catch((e) => {
            console.log(e)
            Log.error("Cannot remove relation : " + e.message);
        });

    process.exit(0);
};
