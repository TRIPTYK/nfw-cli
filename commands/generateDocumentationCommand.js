/**
 * node modules imports
 */

/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const generateDocumentationAction = require('../actions/generateDocumentationAction');
const Log = require('../utils/log');
const {Spinner} = require('clui');

const generateDocSpinner = new Spinner('Generating documentation');

exports.command = 'generateDoc';
exports.aliases = ['doc', 'genDoc'];

exports.describe = 'Generates the typedoc for the current project';

exports.builder = () => {
};

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
