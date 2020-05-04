// node modules 

/* THIS COMMAND NEEDS REWORK */

//import {main} from '../actions/seedAction';
import commandUtils = require('./commandUtils');

//Yargs command syntax
export const command: string = 'seed';

//Yargs command description
export const describe: string = 'read database and write json/xlsx file or read json/xlsx file and write in database';

/**
 *  Yargs command builder
 */


//main function
export async function handler (): Promise<void> {
    commandUtils.validateDirectory();
    //await main();

}
