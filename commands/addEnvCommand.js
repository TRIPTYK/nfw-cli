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

exports.handler = async (argv) => {
    const env = argv.env;

    console.log(chalk.blue('The default choices are based on the default environement setting -> developement.env'));

    let chosenOne = dotenv.parse(fs.readFileSync(`development.env`));

    await editEnvAction(env, chosenOne)
        .then((written) => {
            const [envFile] = written;
            Log.success(`New environment generated successfully`);
            Log.info(`Created ${chalk.cyan(envFile)}`);
        })
        .catch((e) => {
            Log.error("Failed to generate new environment : " + e.message);
        });
};