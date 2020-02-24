/**
 * node modules imports
 */

/**
 * project imports
 */
import installDockerAction = require('../actions/installDockerAction');
import Log = require('../utils/log');
import JsonFileWriter = require('json-file-rw');
import EnvFileWriter = require('env-file-rw');
import {Inquirer} from '../utils/inquirer';
import {DockerStrategy, MongoDBStrategy, MysqlStrategy} from '../database/DockerStrategy';

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

    await new installDockerAction.InstallDockerActionAclass(databaseStrategy, name, port, vers, password).main()
        .catch((e) => {
            Log.error(e.message);
            process.exit();
    });

    /*
    const nfwFile = new JsonFileWriter();
    nfwFile.openSync('.nfw');
    const currentEnv = nfwFile.getNodeValue("env","development");
    const array = nfwFile.getNodeValue(`${currentEnv}.dockerContainers`,[]);
    array.push(name);
    nfwFile.saveSync();

    Log.success(`Your docker container was created on localhost , port ${port} with mysql version ${vers} and password ${password}`);

    const {confirmation} = await inquirer.askForConfirmation("Do you want to update your current environment file with these values ?");

    if (confirmation) {
        const envFileWriter = new EnvFileWriter(currentEnv + '.env');
        envFileWriter.setNodeValue('TYPEORM_HOST','localhost');
        envFileWriter.setNodeValue('TYPEORM_TYPE','mysql');
        envFileWriter.setNodeValue('TYPEORM_PWD',password);
        envFileWriter.setNodeValue('TYPEORM_PORT',port);
        envFileWriter.saveSync();
    }
    */
};
