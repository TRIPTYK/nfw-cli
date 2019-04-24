/**
 * @module editEnvCommand
 * @description Command module to handle environment file editing
 * @author Deflorenne Amaury
 */

// Node modules
const fs = require('fs');
const dotenv = require('dotenv');
const chalk = require('chalk');

// Project modules
const inquirer = require('../utils/inquirer');
const commandUtils = require('./commandUtils');
const editEnvAction = require('../actions/editEnvAction');
const Log = require('../utils/log');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'editENV';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ["ee", "editE"];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Ask a series of questions to edit the environement files';

/**
 * Yargs command builder
 */
exports.builder = () => {

};

/**
 * Main function
 * @return {Promise<void>}
 */
exports.handler = async () => {
    commandUtils.validateDirectory();

    let files = fs.readdirSync('./');

    // select only env files
    let envFiles = files.filter((file) => file.includes('.env')).map((fileName) => fileName.substr(0, fileName.lastIndexOf('.')));

    let {env} = await inquirer.choseEnvFile(envFiles);
    const envFileName = `${env}.env`;
    let chosenOne = dotenv.parse(fs.readFileSync(envFileName));

    await editEnvAction(env, chosenOne)
        .catch((e) => {
            Log.error(`Cannot edit ${envFileName} : ` + e.message);
        })
        .then(() => {
            Log.success(`Edited environment successfully`);
            Log.info(`Updated ${chalk.cyan(envFileName)}`);
        });
};