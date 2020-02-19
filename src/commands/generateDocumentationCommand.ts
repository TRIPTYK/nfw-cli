/**
 * @module generateDocumentationCommand
 * @description Command module to handle generating project documentation
 * @author Deflorenne Amaury
 */

// Node modules imports
import {Spinner} from 'clui';

// Project imports
import commandUtils = require('./commandUtils');
import generateDocumentationAction = require('../actions/generateDocumentationAction');
import Log = require('../utils/log');

const generateDocSpinner = new Spinner('Generating documentation');


//Yargs command
export const command: string = 'generateDoc';

//Yargs command aliases
export const aliases: string[] = ['doc', 'genDoc'];

//Yargs command description
export const describe: string = 'Generates the typedoc for the current project';

//Yargs command builder
exports.builder = () => {
};

/**
 * Main function
 * @return {Promise<void>}
 */
export async function handler (): Promise<void> {
    commandUtils.validateDirectory();

    generateDocSpinner.start();

    await new generateDocumentationAction.GenerateDocumentationActionClass().main()
        .then(() => {
            Log.success('Typedoc generated successfully');
        })
        .catch((e) => {
            Log.error('Typedoc failed to generate : ' + e.message);
        });

    generateDocSpinner.stop();
};
