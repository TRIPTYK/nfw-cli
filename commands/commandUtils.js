/**
 * @module commandUtils
 * @description Functions to help in command modules
 * @author Deflorenne Amaury
 */

const chalk = require('chalk');
const fs = require('fs');

const filesHelper = require('../utils/files');
const { SqlConnection , DatabaseEnv } = require('../database/sqlAdaptator');
const Log = require('../utils/log');

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

exports.checkConnectToDatabase = async () => {
    const nfwFile = fs.readFileSync('.nfw','utf-8');
    const nfwEnv = JSON.parse(nfwFile).env;

    try {
        await new SqlConnection(new DatabaseEnv(`${nfwEnv}.env`)).connect();
    }catch(e) {
        Log.error("Can't connect to database : " + e.message);
        process.exit();
    }
};
