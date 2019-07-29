/**
 * @module commandUtils
 * @description Functions to help in command modules
 * @author Deflorenne Amaury
 */

// node modules
const chalk = require('chalk');
const fs = require('fs');
const { promisify } = require('util');

// project modules
const filesHelper = require('../utils/files');
const { SqlConnection , DatabaseEnv } = require('../database/sqlAdaptator');
const Log = require('../utils/log');
const readFilePromise = promisify(fs.readFile);

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