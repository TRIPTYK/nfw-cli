/**
 * node modules imports
 */

/**
 * project imports
 */
const installDockerAction = require('../actions/installDockerAction');
const Log = require('../utils/log');
const JsonFileWriter = require('json-file-rw');
const EnvFileWriter = require('../utils/envFileWriter');
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

    const nfwFile = new JsonFileWriter('.nfw');
    nfwFile.setNodeValue('dockerContainer',name);
    nfwFile.save();

    Log.success(`Your docker container is running on localhost , port ${port} with mysql version ${vers} and password ${password}`);

    const {confirmation} = await inquirer.askForConfirmation("Do you want to update your current environment file with these values ?");

    if (confirmation) {
        const envFileWriter = new EnvFileWriter(nfwFile.getNodeValue('env','development') + '.env');
        envFileWriter.setNodeValue('TYPEORM_PWD',password);
        envFileWriter.setNodeValue('TYPEORM_PORT',port);
        envFileWriter.save();
    }
};
