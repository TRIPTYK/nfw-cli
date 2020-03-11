/**
 * @module deleteCommand
 * @description Command module to handle entity deletion
 * @author Deflorenne Amaury
 */

// Project imports
import commandUtils = require('./commandUtils');
import deleteAction = require('../actions/deleteAction');
import Log = require('../utils/log');
import { Singleton } from '../utils/DatabaseSingleton';


//Yargs command
export const command: string = 'delete <modelName>';

//Yargs command aliases
export const aliases: string[] = ['del', 'D'];

//Yargs command description
export const describe: string = 'Delete a model';

/**
 * //Yargs command builder
 * @param yargs
 */
//Yargs command builder
export function builder (yargs: any) {
    yargs.option({
        DROP: {
            type: 'boolean',
            default: false
        }
    })
};


//Main function
export async function handler (argv: any): Promise<void> {

    const {modelName} = argv;
    const strategyInstance = Singleton.getInstance();
    const databaseStrategy = strategyInstance.setDatabaseStrategy();

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();

    if (argv.DROP) await commandUtils.checkConnectToDatabase(databaseStrategy);

    // TODO : move all error handling messages to this level
    await new deleteAction.DeleteActionClass(databaseStrategy, modelName, argv.DROP).main()
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
