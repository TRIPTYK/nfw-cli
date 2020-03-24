/**
 * @module removeRelationCommand
 * @description Command module to handle removing relation between 2 models
 * @author Deflorenne Amaury
 */

// node modules
import {Spinner} from 'clui';
import chalk from 'chalk';

// project imports
import commandUtils = require('./commandUtils');
import { RemoveRelationActionClass } from '../actions/removeRelationAction';
import Log = require('../utils/log');
import { MigrateActionClass } from'../actions/migrateAction';
import { AdaptatorStrategy } from '../database/AdaptatorStrategy';
import { Singleton } from '..//utils/DatabaseSingleton';


//Yargs command
export const command: string = 'removeRelation <type> <model1> <model2>';

//Yargs aliases
export const aliases: string[] = ['rr', 'rmRl'];

//Yargs description
export const describe: string = 'Remove a relation between two table. Only works with MySQL databases';


//Handle and build command options
export function builder (yargs: any) {
    yargs.choices('relation',['mtm','mto','otm','oto']);
};


/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
//Main function 
export async function handler (argv: any): Promise<void> {

    const {model1, model2 , type } = argv;
    const strategyInstance = Singleton.getInstance();
    const databaseStrategy: AdaptatorStrategy = strategyInstance.setDatabaseStrategy();

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();
    await commandUtils.checkConnectToDatabase(databaseStrategy);

    await new RemoveRelationActionClass(model1, model2, type).main()
        .then(() => {
            Log.success(`Relation removed between ${model1} and ${model2}`);
        })
        .catch((e) => {
            Log.error("Cannot remove relation : " + e.message);
        });

    const spinner = new Spinner("Generating and executing migration");
    spinner.start();
    await new MigrateActionClass(databaseStrategy, `${model1}-${model2}`).main()
        .then((generated) => {
            spinner.stop();
            const [migrationDir] = generated;
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            spinner.stop();
            Log.error(e.message);
        });

    process.exit(0);
};
