/**
 * @module startUnitTestsCommand
 * @description Command module to handle unit test execution
 * @author Deflorenne Amaury
 */

// node mosules
import JsonFileWriter = require('json-file-rw');
import util = require('util');
const exec = util.promisify(require('child_process').exec);
import fs = require('fs');
import dotenv = require('dotenv');
import chalk from 'chalk';

// Project imports
import commandUtils = require('./commandUtils');
import {Spinner} from 'clui';
import startUnitTestsAction = require('../actions/startUnitTestsAction');
import Log = require('../utils/log');
import { MigrateActionClass } from '../actions/migrateAction';
import inquirer = require("../utils/inquirer");
import { Singleton } from '../utils/DatabaseSingleton';


//Yargs command
export const command: string = 'test';

//Yargs command aliases
export const aliases: string[] = ['t'];

//Yargs command description
export const describe: string = 'Executes unit tests';

//Yargs command builder
exports.builder = (yargs: any) => {};


//Main function
export async function handler (argv: any): Promise<void> {
    const status = new Spinner('Executing unit tests, please wait ...');
    status.start();

    commandUtils.validateDirectory();
    const nfwFile = new JsonFileWriter();
    nfwFile.openSync(".nfw");

    if (nfwFile.nodeExists('dockerContainer')) {
        const containerName = nfwFile.getNodeValue('dockerContainer');
        Log.info("Starting your docker container " + containerName);

        await exec(`docker start ${containerName}`).then(function (data) {
            console.log(data.stdout);
        });
    }

    let connected;
    const currentEnv = commandUtils.getCurrentEnvironment().getEnvironment();

    const strategyInstance = Singleton.getInstance();
    const databaseStrategy = strategyInstance.setDatabaseStrategy();

    try {
        await databaseStrategy.connect(currentEnv);
        connected = true;
    } catch (e) {
        connected = e;
        let clonedEnv = { ... currentEnv };
        delete clonedEnv.TYPEORM_DB;
        await databaseStrategy.connect(clonedEnv);

        if (e.code === 'ER_BAD_DB_ERROR') {
            const dbName = currentEnv.TYPEORM_DB;
            const confirmation = (await new inquirer.Inquirer().askForConfirmation(`Database '${dbName}' does not exists , do you want to create the database ?`)).confirmation;

            if (confirmation) await databaseStrategy.createDatabase(dbName);

            await new MigrateActionClass(databaseStrategy, `create-db-${dbName}`).main()
                .then((isSuccess) => {
                    if (isSuccess) {
                        Log.success(`Executed migration successfully`);
                    }else{
                        Log.error(`Migration failed , please check console output`);
                    }
                })
                .catch((e) => {
                    Log.error(e.message);
                });
        }
    }

    if (connected === true)
        await startUnitTestsAction.main();
    else
        Log.error(`Server can't start because database connection failed : ${connected.message}`);

    status.stop();
    process.exit(0);
};
