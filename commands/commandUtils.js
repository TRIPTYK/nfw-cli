/**
 * @module commandUtils
 * @description Functions to help in command modules
 * @author Deflorenne Amaury
 */

// node modules
const chalk = require('chalk');
const fs = require('fs');

// project modules
const filesHelper = require('../utils/files');
const { SqlConnection , DatabaseEnv } = require('../database/sqlAdaptator');
const Log = require('../utils/log');
const utils = require('../actions/lib/utils');

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
