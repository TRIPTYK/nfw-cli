/**
 * node modules
 */
const fs = require('fs');
const dotenv = require('dotenv');


/**
 * Project modules
 */
const inquirer = require('../utils/inquirer');
const commandUtils = require('./commandUtils');
const editEnvAction = require('../actions/editEnvAction');

exports.command = 'editENV';
exports.aliases = ["ee", "editE"];

exports.describe = 'Ask a series of questions to edit the environement files';

exports.builder = () => {

};

exports.handler = async () => {
    commandUtils.validateDirectory();

    let files = fs.readdirSync('./');

    let envFiles = [];
    files.forEach(element => {
        if (element.includes('.env')) {
            envFiles.push(element.split('.')[0]);
        }
    });

    let {env} = await inquirer.ChoseEnvFile(envFiles);
    let chosenOne = dotenv.parse(fs.readFileSync(`${env}.env`));

    editEnvAction(env, chosenOne);
};