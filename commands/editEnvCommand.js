/**
 * node modules
 */
const fs = require('fs');
const dotenv = require('dotenv');
const chalk = require('chalk');

/**
 * Project modules
 */
const inquirer = require('../utils/inquirer');
const commandUtils = require('./commandUtils');
const editEnvAction = require('../actions/editEnvAction');
const Log = require('../utils/log');

exports.command = 'editENV';
exports.aliases = ["ee", "editE"];

exports.describe = 'Ask a series of questions to edit the environement files';

exports.builder = () => {

};

exports.handler = async () => {
    commandUtils.validateDirectory();

    let files = fs.readdirSync('./');

    // select only env files
    let envFiles = files.filter((file) => file.includes('.env')).map((fileName) => fileName.substr(0, fileName.lastIndexOf('.')));

    let {env} = await inquirer.ChoseEnvFile(envFiles);
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