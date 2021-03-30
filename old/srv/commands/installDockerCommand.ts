/**
 * node modules imports
 */

/**
 * project imports
 */
import { InstallDockerActionAclass } from '../actions/installDockerAction';
import Log = require('../utils/log');
import {Inquirer} from '../utils/inquirer';
import {DockerStrategy, MongoDBStrategy, MysqlStrategy} from '../database/dockerStrategy';

export const command: string = 'setupDatabase';
export const aliases: string[] = ['sdb'];
export const describe: string = 'Setup database container (mysql, mongodb)';

export function builder (yargs: any) {
    yargs.option('name',{
        type : "string",
        default : undefined
    });
    yargs.option('port',{
        type : "string",
        default : undefined
    });
    yargs.option('vers',{
        type : "string",
        default: undefined
    });
    yargs.option('password',{
        type : "string",
        default : "test123*"
    }); 
};

export async function handler (argv: any): Promise<void> {
    const {name,port,vers,password} = argv;
    const inquirer = new Inquirer();

    let dbToInstall = await inquirer.askForDatabase();
    let databaseStrategy: DockerStrategy;

    switch(dbToInstall.dbType){
        case 'mongo': {
            databaseStrategy = new MongoDBStrategy();
            break;
        }
        case 'mysql': {
            databaseStrategy = new MysqlStrategy();
            break;
        }
        default: {
            databaseStrategy = new MysqlStrategy();
            break;
        }
    }

    await new InstallDockerActionAclass(databaseStrategy, name, port, vers, password).main()
        .catch((e) => {
            Log.error(e.message);
            process.exit();
    });

};
