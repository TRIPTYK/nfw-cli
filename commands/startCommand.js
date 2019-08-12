/**
 * @module startCommand
 * @description Command module to handle server start and monitoring
 * @author Deflorenne Amaury
 */

const dotenv = require('dotenv');
const fs = require('fs');
const chalk = require('chalk');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// node modules
const inquirer = require("../utils/inquirer");

// Project imports
const commandUtils = require('./commandUtils');
const startAction = require('../actions/startAction');
const migrateAction = require('../actions/migrateAction');
const {SqlConnection} = require("../database/sqlAdaptator");
const Log = require('../utils/log');
const JsonFileWriter = require('../utils/jsonFileWriter');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'start';

/**
 * Yargs command aliases
 * @type {Array}
 */
exports.aliases = [];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Start the api server';

/**
 * Yargs command builder
 * @param yargs
 */
exports.builder = (yargs) => {
    yargs.option('env', {
        desc: "Specify the environement type",
        type: "string",
        default: "development"
    });
    yargs.option('monitoring', {
        desc: "Launch monitoring websockets server",
        type: "boolean",
        default: false
    });
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    commandUtils.validateDirectory();

    const environement = argv.env;
    const monitoringEnabled = argv.monitoring;

    const envFileContent = fs.readFileSync(`${environement}.env`);
    const nfwFile = new JsonFileWriter(".nfw");
    const ormconfigFile = new JsonFileWriter(`ormconfig.json`);
    let envFile = dotenv.parse(envFileContent);

    ormconfigFile.setNodeValue("name",envFile.TYPEORM_NAME);
    ormconfigFile.setNodeValue("host",envFile.TYPEORM_HOST);
    ormconfigFile.setNodeValue("database",envFile.TYPEORM_DB);
    ormconfigFile.setNodeValue("username",envFile.TYPEORM_USER);
    ormconfigFile.setNodeValue("password",envFile.TYPEORM_PWD);
    ormconfigFile.setNodeValue("port",envFile.TYPEORM_PORT);
    ormconfigFile.saveSync();

    if (nfwFile.nodeExists('dockerContainer')) {
        const containerName = nfwFile.getNodeValue('dockerContainer');
        Log.info("Starting your docker container " + containerName);

        await exec(`docker start ${containerName}`).then(function (data) {
            console.log(data.stdout);
        });
    }

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
        await sqlConnection.connect(clonedEnv);

        if (e.code === 'ER_BAD_DB_ERROR') {
            const dbName = currentEnv.TYPEORM_DB;
            const confirmation = (await inquirer.askForConfirmation(`Database '${dbName}' does not exists , do you want to create the database ?`)).confirmation;

            if (confirmation) await sqlConnection.createDatabase(dbName);

            await migrateAction(`create-db-${dbName}`)
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

    if (connected === true)
        startAction(environement, monitoringEnabled);
    else
        Log.error(`Server can't start because database connection failed : ${connected.message}`);
};
