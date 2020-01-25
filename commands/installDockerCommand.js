/**
 * node modules imports
 */

/**
 * project imports
 */
const installDockerAction = require('../actions/installDockerAction');
const Log = require('../utils/log');
const JsonFileWriter = require('json-file-rw');
const EnvFileWriter = require('env-file-rw');
const inquirer = require('../utils/inquirer');

exports.command = 'setupMysql';
exports.aliases = ['smysql'];

exports.describe = 'desc';

exports.builder = (yargs) => {
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

exports.handler = async (argv) => {
    const {name,port,vers,password} = argv;

    await installDockerAction(name,port,vers,password).catch((e) => {
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

    const {confirmation} = await inquirer.askForConfirmation("Do you want to update your current environment file with these values ?");

    if (confirmation) {
        const envFileWriter = new EnvFileWriter(currentEnv + '.env');
        envFileWriter.setNodeValue('TYPEORM_HOST','localhost');
        envFileWriter.setNodeValue('TYPEORM_TYPE','mysql');
        envFileWriter.setNodeValue('TYPEORM_PWD',password);
        envFileWriter.setNodeValue('TYPEORM_PORT',port);
        envFileWriter.saveSync();
    }
};
