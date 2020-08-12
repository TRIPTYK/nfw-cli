/**
 * @module generateEmberDataModelCommand
 * @description Command module to handle generating ember data model
 * @author Deflorenne Amaury
 */

// Project imports
import commandUtils = require('./commandUtils');
import Log = require('../utils/log');
import generateMirageModelAction from '../actions/generateMirageModelAction';
import kebabCase from '@queso/kebab-case';
import { plural } from 'pluralize';

//Yargs command
export const command: string = 'generateMirageData <model> [rows]';

//Yargs command aliases
export const aliases: string[] = [];

//Yargs command description
export const describe: string = 'Generates mirage data';

//Yargs command builder
export function builder (yargs) {
    yargs.option('rows', {
        default: 10,
        type: 'number'
    });
};

//Main function
export async function handler (argv: any): Promise<void> {
    commandUtils.validateDirectory();

    const { model , rows } = argv;

    await generateMirageModelAction(model,rows)
        .then(() => {
            Log.success(`Please copy your clipboard to mirage/fixtures/${kebabCase(plural(model))}.js`);
            Log.info('Copied to clipboard');
        })
        .catch((e) => {
            console.log(e);
            Log.error('Failed to generate model ' + e.message);
        });

    process.exit(0);
};
