/**
 * @module startCommand
 * @description Command module to handle server start and monitoring
 * @author Deflorenne Amaury
 */

// node modules
const inquirer = require("../utils/inquirer");

// Project imports
const commandUtils = require('./commandUtils');
const startAction = require('../actions/startAction');
const {SqlConnection} = require("../database/sqlAdaptator");


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

    const sqlConnection = new SqlConnection();
    const currentEnv = commandUtils.getCurrentEnvironment().getEnvironment();

    try {
        await sqlConnection.connect(currentEnv);
    } catch (e) {
        let clonedEnv = { ... currentEnv };
        delete clonedEnv.TYPEORM_DB;
        await sqlConnection.connect(clonedEnv);

        if (e.code === 'ER_BAD_DB_ERROR') {
            const dbName = currentEnv.TYPEORM_DB;
            const confirmation = (await inquirer.askForConfirmation(`Database '${dbName}' does not exists , do you want to create the database ?`)).confirmation;

            if (confirmation) await sqlConnection.createDatabase(dbName);
        }
    }
 
    startAction(environement, monitoringEnabled);
};
