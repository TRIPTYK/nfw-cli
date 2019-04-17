/**
 * node modules
 */
const yargs = require('yargs');
const chalk = require('chalk');

exports.command = 'info';
exports.aliases = ['i'];

exports.describe = 'Show the information about the developers';

exports.builder = (yargs) => {
};

exports.handler = (argv) => {
    console.log(
        chalk.bgGreen('Made by :') +
        "\n Amaury Deflorenne <https://github.com/AmauryD>" +
        "\n Romain Verliefden <https://github.com/DramixDW>" +
        "\n Samuel Antoine <https://github.com/Snorkell>" +
        "\n Steve Lebleu <https://github.com/konfer-be>"
    );
};
