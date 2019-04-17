/**
 * node modules
 */
const fs = require('fs');
const dotenv = require('dotenv');
const chalk = require('chalk');

/**
 * Project modules
 */
const editEnvAction = require('../actions/editEnvAction');

exports.command = 'addENV <env>';
exports.aliases = ["ae", "addE"];

exports.describe = 'Generate a new environement based on asked question';

exports.builder = () => {

};

exports.handler = (argv) => {
    const env = argv.env;

    console.log(chalk.blue('The default choices are based on the default environement setting -> developement.env'));

    let chosenOne = dotenv.parse(fs.readFileSync(`development.env`));

    editEnvAction(env, chosenOne);
};