/**
 * @module generateEmberDataModelCommand
 * @description Command module to handle generating ember data model
 * @author Deflorenne Amaury
 */

// Node modules imports
import {Spinner} from 'clui';

// Project imports
import commandUtils = require('./commandUtils');
import generateEmberDataModelAction = require('../actions/generateEmberDataModelAction');
import Log = require('../utils/log');


//Yargs command
export const command: string = 'generateEModel <model>';

//Yargs command aliases
export const aliases: string[] = ['gedm', 'gem'];

//Yargs command description
export const describe: string = 'Generates an ember data model';


//Yargs command builder
export function builder () {};


//Main function
export async function handler (argv: any): Promise<void> {
    commandUtils.validateDirectory();

    const { model } = argv;

    await new generateEmberDataModelAction.GenerateEmberDataModelActionClass(model).main()
        .then(() => {
            Log.success('Generate model' + model + ' successfully');
            Log.info('Copied to clipboard');
        })
        .catch((e) => {
            Log.error('Failed to generate model ' + e.message);
        });

    process.exit(0);
};
