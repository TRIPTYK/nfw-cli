/**
 * @module startCommand
 * @description Command module to handle server start and monitoring
 * @author Deflorenne Amaury
 */
import chalk from 'chalk';

// node modules
import inquirer = require("../utils/inquirer");

// Project imports
import commandUtils = require('./commandUtils');
import startAction = require('../actions/startAction');
import migrateAction = require('../actions/migrateAction');
import {SqlConnection} from "../database/sqlAdaptator";
import Log = require('../utils/log');
import JsonFileWriter = require('json-file-rw');

 //Yargs command
export const command: string = 'start';

//Yargs command aliases
export const aliases: string[] = [];

//Yargs command description
export const describe: string = 'Start the api server';

//Yargs command builder
export function builder (yargs: any) {
    yargs.option('env', {
        desc: "Specify the environement type",
        type: "string"
    });
};


//Main function
export async function handler (argv: any): Promise<void> {

    commandUtils.validateDirectory();

    let environement = argv.env;
    const monitoringEnabled = argv.monitoring;

    const nfwFile = new JsonFileWriter();
    nfwFile.openSync(".nfw");

    if (environement === undefined) {
        environement = nfwFile.getNodeValue("env","development");
    }

    commandUtils.updateORMConfig(environement);
    await commandUtils.startDockerContainers(environement);

    let connected;
    const currentEnv = commandUtils.getCurrentEnvironment().getEnvironment();
    const sqlConnection = new SqlConnection();

    try {
        await sqlConnection.connect(currentEnv);

        connected = true;
    } catch (e) {

        connected = e;
        let clonedEnv = { ... currentEnv };
        
        delete clonedEnv.TYPEORM_DB;

        await sqlConnection.connect(clonedEnv).catch((e) => {
            
            Log.error("Failed to pre-connect to database : " + e.message);
            Log.info(`Please check your ${environement} configuration and if your server is running`);
            process.exit(1);
        });

        if (e.code === 'ER_BAD_DB_ERROR') {
            
            const dbName = currentEnv.TYPEORM_DB;
            const confirmation = (await new inquirer.Inquirer().askForConfirmation(`Database '${dbName}' does not exists , do you want to create the database ?`)).confirmation;

            if (confirmation) await sqlConnection.createDatabase(dbName);

            await new migrateAction.MigrateActionClass(`create-db-${dbName}`).Main()
                .then((generated) => {
                    
                    const [migrationDir] = generated;
                    Log.success(`Executed migration successfully`);
                    Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
                    connected = true;
                })
                .catch((err) => {
                    
                    connected = err;
                });
        }
    }

    if (connected === true){
        new startAction.StartActionClass(environement, monitoringEnabled).Main();
    }
        
    else
        Log.error(`Server can't start because database connection failed : ${connected.message}`);
};
