/**
 * @module startCommand
 * @description Command module to handle server start and monitoring
 * @author Deflorenne Amaury
 */
const chalk = require('chalk');

// node modules
const inquirer = require("../utils/inquirer");

// Project imports
const commandUtils = require('./commandUtils');
const startAction = require('../actions/startAction');
const migrateAction = require('../actions/migrateAction');
const {SqlConnection} = require("../database/sqlAdaptator");
const Log = require('../utils/log');
const JsonFileWriter = require('json-file-rw');

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
        type: "string"
    });
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
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
        await sqlConnection.connect(clonedEnv)
            .catch((e) => {
                Log.error("Failed to pre-connect to database : " + e.message);
                Log.info(`Please check your ${environement} configuration and if your server is running`);
                process.exit(1);
            });

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
