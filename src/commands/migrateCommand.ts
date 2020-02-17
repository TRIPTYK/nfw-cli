/**
 * @module migrateCommmand
 * @description Command module to execute migration of a model
 * @author Deflorenne Amaury
 */


// Node modules
import reservedWords = require('reserved-words');
import {Spinner} from 'clui';
import chalk from 'chalk';


// Project imports
import commandUtils = require('./commandUtils');
import Log = require('../utils/log');
import migrateAction = require('../actions/migrateAction');
import utils = require('../actions/lib/utils');

//Yargs command
export const command: string = 'migrate <migrateName>';

//Yargs command aliases
export const aliases: string[] = ["mig", "M"];

//Yargs command description
export const describe: string = 'Generate, compile and run the migration';


//Yargs command builder
export function builder (yargs: any) {
    yargs.check(_validateArgs);
    yargs.option('restore', {
        desc: "Restore migration data at a specific state",
        type: "boolean",
        default: false
    });
    yargs.option('revert', {
        desc: "Revert migration at a specific state",
        type: "boolean",
        default: false
    });
    yargs.option('dump',{
        desc :'dump', 
        type : "boolean",
        default : false
    });
};

/**
 * 
 * @param argv
 * @param options
 * @return {boolean}
 */
const _validateArgs = (argv: any, options: boolean): boolean => {
    if (!utils.isAlphanumeric(argv.migrateName)) throw new Error("<migrateName> is non alphanumeric");
    if (reservedWords.check(argv.migrateName, 6)) throw new Error("<migrateName> is a reserved word");
    return true;
};

//Main function
export async function handler (argv: any): Promise<void> {
    const modelName = argv.migrateName;
    const restore = argv.restore;
    const dump = argv.dump ;
    const revert = argv.revert;
    const spinner = new Spinner("Generating and executing migration");

    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();
  
    commandUtils.updateORMConfig();

    spinner.start();

    await new migrateAction.MigrateActionClass(modelName,restore,dump,revert).Main()
        .then((generated) => {
            const [migrationDir] = generated;
            spinner.stop();
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            spinner.stop();
            Log.error(e.message);
        });

    process.exit(0);
};
