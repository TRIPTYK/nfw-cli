/**
 * @module startUnitTestsCommand
 * @description Command module to handle unit test execution
 * @author Deflorenne Amaury
 */

// node mosules
const JsonFileWriter = require('json-file-rw');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const dotenv = require('dotenv');

// Project imports
const commandUtils = require('./commandUtils');
const {Spinner} = require('clui');
const startUnitTestsAction = require('../actions/startUnitTestsAction');
const Log = require('../utils/log');
const migrateAction = require('../actions/migrateAction');
const {SqlConnection} = require("../database/sqlAdaptator");
const inquirer = require("../utils/inquirer");

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'test';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['t'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Executes unit tests';

/**
 * Yargs command builder
 * @param yargs
 */
exports.builder = (yargs) => {

};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const status = new Spinner('Executing unit tests, please wait ...');
    status.start();

    commandUtils.validateDirectory();

    const envFileContent = fs.readFileSync(`test.env`);
    const ormconfigFile = new JsonFileWriter();
    ormconfigFile.openSync(`ormconfig.json`);
    let envFile = dotenv.parse(envFileContent);

    ormconfigFile.setNodeValue("name",envFile.TYPEORM_NAME);
    ormconfigFile.setNodeValue("host",envFile.TYPEORM_HOST);
    ormconfigFile.setNodeValue("database",envFile.TYPEORM_DB);
    ormconfigFile.setNodeValue("username",envFile.TYPEORM_USER);
    ormconfigFile.setNodeValue("password",envFile.TYPEORM_PWD);
    ormconfigFile.setNodeValue("port",envFile.TYPEORM_PORT);
    ormconfigFile.saveSync();

    const nfwFile = new JsonFileWriter();
    nfwFile.openSync(".nfw");

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
        await startUnitTestsAction();
    else
        Log.error(`Server can't start because database connection failed : ${connected.message}`);

    status.stop();
    process.exit(0);
};
