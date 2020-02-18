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
import inquirer = require('../utils/inquirer');

export const command: string = 'setupMysql';
export const aliases: string[] = ['smysql'];
export const describe: string = 'desc';

export function builder (yargs: any) {
    yargs.option('name',{
        type : "string",
        default : "nfw_server_docker"
    });
    yargs.option('port',{
        type : "string",
        default : "3306"
    });
    yargs.option('vers',{
        type : "string",
        default: "5.7"
    });
    yargs.option('password',{
        type : "string",
        default : "test123*"
    });
};

export async function handler (argv: any) {
    const {name,port,vers,password} = argv;

    await new installDockerAction.InstallDockerActionAclass(name,port,vers,password).Main()
        .catch((e) => {
            Log.error(e.message);
            process.exit();
    });

    const nfwFile = new JsonFileWriter();
    nfwFile.openSync('.nfw');
    const currentEnv = nfwFile.getNodeValue("env","development");
    const array = nfwFile.getNodeValue(`${currentEnv}.dockerContainers`,[]);
    array.push(name);
    nfwFile.saveSync();

    Log.success(`Your docker container was created on localhost , port ${port} with mysql version ${vers} and password ${password}`);

    const {confirmation} = await new inquirer.Inquirer().askForConfirmation("Do you want to update your current environment file with these values ?");

    if (confirmation) {
        const envFileWriter = new EnvFileWriter(currentEnv + '.env');
        envFileWriter.setNodeValue('TYPEORM_HOST','localhost');
        envFileWriter.setNodeValue('TYPEORM_TYPE','mysql');
        envFileWriter.setNodeValue('TYPEORM_PWD',password);
        envFileWriter.setNodeValue('TYPEORM_PORT',port);
        envFileWriter.saveSync();
    }
};
