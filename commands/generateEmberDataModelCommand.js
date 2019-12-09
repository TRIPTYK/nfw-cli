/**
 * @module generateEmberDataModelCommand
 * @description Command module to handle generating ember data model
 * @author Deflorenne Amaury
 */

// Node modules imports
const {Spinner} = require('clui');

// Project imports
const commandUtils = require('./commandUtils');
const generateEmberDataModelAction = require('../actions/generateEmberDataModelAction');
const Log = require('../utils/log');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'generateEModel <model>';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['gedm', 'gem'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generates an ember data models';

/**
 * Yargs command builder
 */
exports.builder = () => {
};

/**
 * Main function
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    commandUtils.validateDirectory();

    const { model } = argv;

    await generateEmberDataModelAction(model)
        .then(() => {
            Log.success('Generate model' + model + ' successfully');
            Log.info('Copied to clipboard');
        })
        .catch((e) => {
            Log.error('Failed to generate model ' + e.message);
        });

    process.exit(0);
};
