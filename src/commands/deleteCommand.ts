/**
 * @module deleteCommand
 * @description Command module to handle entity deletion
 * @author Deflorenne Amaury
 */

// Project imports
import commandUtils = require('./commandUtils');
import deleteAction from '../actions/deleteAction';
import Log = require('../utils/log');
import { Singleton } from '../utils/DatabaseSingleton';


//Yargs command
export const command: string = 'delete <modelName>';

//Yargs command aliases
export const aliases: string[] = ['del', 'd'];

//Yargs command description
export const describe: string = 'Delete a model';

//Yargs command builder
export function builder (yargs: any) {
    yargs.option({})
};


//Main function
export async function handler (argv: any): Promise<void> {
    const {modelName} = argv;
    commandUtils.validateDirectory();
    await commandUtils.checkVersion();

    await deleteAction(modelName)
        .then((array) => {
            array.forEach((e) => {
                Log.logModification(e);
            });
        })
        .catch((e) => { // catch unhandled errors
            Log.error(`Failed to delete ${modelName} : ${e.message}`);
        });

    process.exit();
};
