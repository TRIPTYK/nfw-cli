/**
 * Node modules
 */
const dotenv = require('dotenv');
const spawn = require('cross-spawn');
const fs = require('fs');
const path = require('path');

/**
 * Project modules
 */
const sqlAdaptor = require('../database/sqlAdaptator');
const Log = require('../utils/log');
const inquirer = require('../utils/inquirer');

module.exports = async (environment, monitoringEnabled) => {
    const envFileContent = fs.readFileSync(`${environment}.env`);
    const ormConfigContent = fs.readFileSync(`ormconfig.json`);

    let envFile = dotenv.parse(envFileContent);
    let ormconfigFile = JSON.parse(ormConfigContent);

    let mergeNeeded = false;

    if (envFile.TYPEORM_TYPE === ormconfigFile.type && (envFile.TYPEORM_NAME !== ormconfigFile.name)) {
        mergeNeeded = true;
    }
    if ((envFile.TYPEORM_HOST !== ormconfigFile.host) && !mergeNeeded) {
        mergeNeeded = true;
    }
    if ((envFile.TYPEORM_DB !== ormconfigFile.database) && !mergeNeeded) {
        mergeNeeded = true;
    }
    if ((envFile.TYPEORM_USER !== ormconfigFile.username) && !mergeNeeded) {
        mergeNeeded = true;
    }
    if ((envFile.TYPEORM_PWD !== ormconfigFile.password) && !mergeNeeded) {
        mergeNeeded = true;
    }
    if ((parseInt(envFile.TYPEORM_PORT) !== ormconfigFile.port) && !mergeNeeded) {
        mergeNeeded = true;
    }

    if (mergeNeeded) {
        ormconfigFile.name = envFile.TYPEORM_NAME;
        ormconfigFile.host = envFile.TYPEORM_HOST;
        ormconfigFile.database = envFile.TYPEORM_DB;
        ormconfigFile.username = envFile.TYPEORM_USER;
        ormconfigFile.password = (envFile.TYPEORM_PWD);
        ormconfigFile.port = parseInt(envFile.TYPEORM_PORT);

        fs.writeFileSync('ormconfig.json', JSON.stringify(ormconfigFile, null, 1));
        console.log(chalk.green('Successfully updated the ormconfig.json file'))
    }

    try {
        await sqlAdaptor.tryConnect();
    } catch (e) {
        console.log(e);
        if (e.code === 'ER_BAD_DB_ERROR') {
            let {canCreate} = await inquirer.askForDatabaseCreation();
            if (canCreate) {
                await sqlAdaptor.createDatabase();
            }
        } else {
            Log.error(`Unhandled database connection error (${e.code}) : exiting ...`);
            process.exit();
        }
    }

    if (monitoringEnabled) {
        let monitoring = spawn(`node`, [`${path.resolve('monitoring', 'app.js')}`]);
        monitoring.stdout.on('data', (chunk) => {
            console.log(`Monitoring: ${chunk}`)
        });
        monitoring.stderr.on('data', (chunk) => {
            console.log(`Monitoring error : ${chunk}`)
        });

    }

    let executed = spawn(`ts-node-dev --respawn --transpileOnly ./src/app.bootstrap.ts --env ${environment}`);

    executed.stdout.on('data', (chunk) => {
        console.log(chunk.toString())
    });

    executed.on('close', (code) => {
        console.log(chalk.red(`Process exited with code ${code}`));
    });
};