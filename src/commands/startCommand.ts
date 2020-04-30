/**
 * @module startCommand
 * @description Command module to handle server start and monitoring
 * @author Deflorenne Amaury
 */
import chalk from 'chalk';

// node modules
import { Inquirer } from "../utils/inquirer";

// Project imports
import commandUtils = require('./commandUtils');
import { StartActionClass } from '../actions/startAction';
import { MigrateActionClass }from '../actions/migrateAction';
import Log = require('../utils/log');
import JsonFileWriter = require('json-file-rw');
import { Singleton } from '../utils/DatabaseSingleton';

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
    const strategyInstance = Singleton.getInstance();
    const databaseStrategy = strategyInstance.setDatabaseStrategy();

    try {
        await databaseStrategy.connect(currentEnv);
        connected = true;
    } catch (e) {

        connected = e;
        let clonedEnv = { ... currentEnv };
        
        delete clonedEnv.TYPEORM_DB;

        await databaseStrategy.connect(clonedEnv).catch((e) => {

            Log.error("Failed to pre-connect to database : " + e.message);
            Log.info(`Please check your ${environement} configuration and if your server is running`);
            process.exit(1);
        });

        if (e.code === 'ER_BAD_DB_ERROR') {

            const dbName = currentEnv.TYPEORM_DB;
            const confirmation = (await new Inquirer().askForConfirmation(`Database '${dbName}' does not exists , do you want to create the database ?`)).confirmation;

            if (confirmation) await databaseStrategy.createDatabase(dbName);

            await new MigrateActionClass(databaseStrategy, `create-db-${dbName}`).main()
                .then((isSuccess) => {
                    if (isSuccess) {
                        Log.success(`Executed migration successfully`);
                    }else{
                        Log.error(`Migration failed , please check console output`);
                    }
                })
                .catch((err) => {
                    
                    connected = err;
                });
        }
    }

    if (connected === true){
        new StartActionClass(environement, monitoringEnabled).main();
    }
        
    else
        Log.error(`Server can't start because database connection failed : ${connected.message}`);
};
