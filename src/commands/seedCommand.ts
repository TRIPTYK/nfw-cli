// node modules 

import {main} from '../actions/seedAction';


//Yargs command syntax
export const command: string = 'seed';

//Yargs command description
export const describe: string = 'read database and write json/xlsx file or read json/xlsx file and write in database';

/**
 *  Yargs command builder
 */


//main function
export async function handler (): Promise<void> {
    await main();

}
