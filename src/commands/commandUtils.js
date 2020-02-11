/**
 * @module commandUtils
 * @description Functions to help in command modules
 * @author Deflorenne Amaury
 */

// node modules
const chalk = require('chalk');
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// project modules
const filesHelper = require('../utils/files');
const { SqlConnection , DatabaseEnv } = require('../database/sqlAdaptator');
const Log = require('../utils/log');
const readFilePromise = promisify(fs.readFile);
const JsonFileWriter = require('json-file-rw');
const dotenv = require('dotenv');

/**
 * Check if we are in a valid project directory
 * @return {void}
 */
exports.validateDirectory = () => {
    if (!filesHelper.isProjectDirectory()) {
        console.log(chalk.bgRed(chalk.black('ERROR ! : You are not in a project directory')));
        process.exit(0);
    }
};

/**
 *
 * @param string
 */
exports.checkValidParam = (string) => {
    if (!util.isValidParam(string)) {
        Log.error(`'${string}' must be alphanumeric and not beginning by a number`);
        process.exit();
    }
};

exports.startDockerContainers = async (environement) => {
    const nfwFile = new JsonFileWriter();
    nfwFile.openSync(".nfw");
    const snooze = ms => new Promise(resolve => setTimeout(resolve, ms));

    if (nfwFile.nodeExists(`${environement}.dockerContainers`)) {
        const containers = nfwFile.getNodeValue(`${environement}.dockerContainers`);

        for (const container of containers) {
            Log.info("Starting your docker container " + container);

            exec(`docker start ${container}`);
        }
    }

    await snooze(1000);
}

exports.updateORMConfig = (environement = null) => {
    if (environement === null) {
        const nfwFile = new JsonFileWriter();
        nfwFile.openSync(".nfw");
        environement = nfwFile.getNodeValue("env","development");
        nfwFile.saveSync();
    }

    const envFileContent = fs.readFileSync(`${environement}.env`);

    const ormconfigFile = new JsonFileWriter();
    ormconfigFile.openSync(`ormconfig.json`);
    let envFile = dotenv.parse(envFileContent);

    ormconfigFile.setNodeValue("cli.migrationsDir",path.join("./src/migration/",environement));
    ormconfigFile.setNodeValue("migrations",[
        `src/migration/${environement}/*.ts`
    ]);
    ormconfigFile.setNodeValue("type",envFile.TYPEORM_TYPE);
    ormconfigFile.setNodeValue("name",envFile.TYPEORM_NAME);
    ormconfigFile.setNodeValue("host",envFile.TYPEORM_HOST);
    ormconfigFile.setNodeValue("database",envFile.TYPEORM_DB);
    ormconfigFile.setNodeValue("username",envFile.TYPEORM_USER);
    ormconfigFile.setNodeValue("password",envFile.TYPEORM_PWD);
    ormconfigFile.setNodeValue("port",envFile.TYPEORM_PORT);
    return ormconfigFile.saveSync();
}

/**
 *
 * @returns {Promise<void>}
 */
exports.checkConnectToDatabase = async () => {
    try {
        await new SqlConnection(exports.getCurrentEnvironment()).connect();
    }catch(e) {
        Log.error("Can't connect to database : " + e.message);
        process.exit();
    }
};

/**
 *
 * @returns {DatabaseEnv}
 */
exports.getCurrentEnvironment = () => {
    const nfwFile = fs.readFileSync('.nfw','utf-8');
    let nfwEnv = JSON.parse(nfwFile).env;

    if (!nfwEnv) nfwEnv = 'development';

    return new DatabaseEnv(`${nfwEnv.toLowerCase()}.env`);
};

/**
 *
 * @return {Promise<void>}
 */
exports.checkVersion = async () => {
    let [packageJsonCLI,packageJsonNFW] = await Promise.all(
        [readFilePromise(__baseDir + "/package.json","utf-8"),readFilePromise(process.cwd() + "/package.json","utf-8")]
    );
    packageJsonCLI = JSON.parse(packageJsonCLI);
    packageJsonNFW = JSON.parse(packageJsonNFW);

    if (packageJsonCLI.version > packageJsonNFW.version)
        Log.warning("Your version of NFW is for an old verson of NFW-CLI , you may encounter unexpected behavior. Consider upgrading your nfw or downgrade your CLI to " + packageJsonNFW.version);
}

