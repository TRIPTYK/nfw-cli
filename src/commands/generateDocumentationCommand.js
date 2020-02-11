/**
 * @module generateDocumentationCommand
 * @description Command module to handle generating project documentation
 * @author Deflorenne Amaury
 */

// Node modules imports
const {Spinner} = require('clui');

// Project imports
const commandUtils = require('./commandUtils');
const generateDocumentationAction = require('../actions/generateDocumentationAction');
const Log = require('../utils/log');

const generateDocSpinner = new Spinner('Generating documentation');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'generateDoc';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['doc', 'genDoc'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generates the typedoc for the current project';

/**
 * Yargs command builder
 */
exports.builder = () => {
};

/**
 * Main function
 * @return {Promise<void>}
 */
exports.handler = async () => {
    commandUtils.validateDirectory();

    generateDocSpinner.start();

    await generateDocumentationAction()
        .then(() => {
            Log.success('Typedoc generated successfully');
        })
        .catch((e) => {
            Log.error('Typedoc failed to generate : ' + e.message);
        });

    generateDocSpinner.stop();
};
