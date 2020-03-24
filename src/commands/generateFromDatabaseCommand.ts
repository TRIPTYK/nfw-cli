/**
 * @module generateFromDatabaseCommand
 * @description Handle generating entity from database
 * @author Deflorenne Amaury
 */

// node modules imports
import chalk from 'chalk';

// project imports
import commandUtils = require('./commandUtils');
import {Inquirer}from '../utils/inquirer';
import Log = require('../utils/log');
import { Singleton } from '../utils/DatabaseSingleton';
import { AdaptatorStrategy } from '../database/AdaptatorStrategy';

import { GenerateFromDatabaseActionClass } from '../actions/generateFromDatabaseAction';


//Yargs command
export const command: string = 'import';

//Yargs command aliases
export const aliases: string[] = ['imp'];

//Yargs command description
export const describe: string = 'Generate all the files from existing tables in the database';

//Yargs command builder
export function builder () {
};

/**
 * Main function
 * @return {Promise<void>}
 */
export async function handler (): Promise<void> {

    const strategyInstance = Singleton.getInstance();
    const databaseStrategy: AdaptatorStrategy = strategyInstance.setDatabaseStrategy();

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();
    await commandUtils.checkConnectToDatabase(databaseStrategy);

    const inquirer = new Inquirer();
    const {confirmation} = await inquirer.askForConfirmation(`${chalk.bgYellow(chalk.black('Warning :'))} generate model from the database will override existing models with the same name ! Do you want to continue ?`);

    if (confirmation) {
        await new GenerateFromDatabaseActionClass().main(databaseStrategy)
            .then(() => {
                Log.success('Generated from database successfully');
            })
            .catch((e) => {
                Log.error(e.message);
            });
    } else {
        console.log(chalk.bgRed(chalk.black('/!\\ Process Aborted /!\\')));
        process.exit(0);
    }

    process.exit(0);
};