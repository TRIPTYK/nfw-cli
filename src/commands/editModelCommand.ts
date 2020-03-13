/**
 * @module editModelCommand
 * @description Command module to handle editing of a given entity
 * @author Deflorenne Amaury
 */

// Project imports
import commandUtils = require('./commandUtils');
import utils = require('../actions/lib/utils');
import { EditModelClass } from '../actions/editModelAction';
import Log = require('../utils/log');
import migrate = require('../actions/migrateAction');
import {columnExist,format} from '../actions/lib/utils';

//Node Modules
import {Spinner} from 'clui';
import chalk from 'chalk';
import { Singleton } from '../utils/DatabaseSingleton';


//Yargs command
export const command: string = 'editModel <model> <action> [columnName]';

//Yargs command aliases
export const aliases: string[] = ["em", "edit"];

//Yargs command description
export const describe: string = 'add or remove column in an existing model\nAction can be either add or remove\ncolumnName is required only for the remove action.';


//Yargs command builder
export function builder (yargs: any) {
    yargs.choices('action',['remove','add']);
};


//Main function
export async function handler (argv: any): Promise<void> {

    let {model, columnName, action} = argv;
    
    const strategyInstance = Singleton.getInstance();
    const databaseStrategy = strategyInstance.setDatabaseStrategy();

    model= format(model);
    const spinner = new Spinner("Generating and executing migration");
    commandUtils.validateDirectory();
    await commandUtils.checkVersion();
    await commandUtils.checkConnectToDatabase(databaseStrategy);

    if (!utils.modelFileExists(model)) {
        Log.error("Model should exist in order to edit him");
        process.exit(0);
    }

    if (action === 'remove' && !columnName) {
        Log.info("you must specify the column to remove");
    } else if (action === 'add') {
        if(columnName && columnExist(model,columnName)){
            Log.error('column already exist');
            process.exit(0);
        }
        await new EditModelClass('add', model,columnName).main()
            .then(async () =>{
                spinner.start();
                await new migrate.MigrateActionClass(databaseStrategy, `remove-${columnName}-from-${model}`).main()
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
            })
            .catch((e) => {
                console.log(e);
                Log.error('Failed to edit model : ' + e.message)
            });
    } else if (action === 'remove' && columnName) {
        await new EditModelClass('remove', model, columnName).main()
            .then(async () => {
                spinner.start();
                await new migrate.MigrateActionClass(databaseStrategy, `remove-${columnName}-from-${model}`).main()
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
            })
            .catch((e) => {
                Log.error('Failed to edit model : ' + e.message)
            })
    }


    process.exit(0);
};