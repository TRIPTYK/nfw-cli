/**
 * @module startCommand
 * @description Command module to handle server start and monitoring
 * @author Deflorenne Amaury
 */

const dotenv = require('dotenv');
const fs = require('fs');
const chalk = require('chalk');

// node modules
const inquirer = require("../utils/inquirer");

// Project imports
const commandUtils = require('./commandUtils');
const startAction = require('../actions/startAction');
const migrateAction = require('../actions/migrateAction');
const {SqlConnection} = require("../database/sqlAdaptator");
const Log = require('../utils/log');

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
    const ormConfigContent = fs.readFileSync(`ormconfig.json`);

    let envFile = dotenv.parse(envFileContent);
    let ormconfigFile = JSON.parse(ormConfigContent);
    ormconfigFile.name = envFile.TYPEORM_NAME;
    ormconfigFile.host = envFile.TYPEORM_HOST;
    ormconfigFile.database = envFile.TYPEORM_DB;
    ormconfigFile.username = envFile.TYPEORM_USER;
    ormconfigFile.password = (envFile.TYPEORM_PWD);
    ormconfigFile.port = parseInt(envFile.TYPEORM_PORT);
    fs.writeFileSync('ormconfig.json', JSON.stringify(ormconfigFile, null, 2));

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
                .catch((e) => {
                    Log.error(e.message);
                });
        }
    }

    if (connected === true)
        startAction(environement, monitoringEnabled);
    else
        Log.error(`Server can't start because database connection failed : ${connected.message}`);
};
