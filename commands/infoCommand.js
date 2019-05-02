/**
 * @module infoCommand
 * @description Command module to display project information
 * @author Deflorenne Amaury
 */

// Node modules
const chalk = require('chalk');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'info';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['i'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Show the information about the developers';

/**
 * Yargs command builder
 */
exports.builder = () => {

};

/**
 * Main function
 * @return {void}
 */
exports.handler = () => {
    console.log(
        chalk.bgGreen('Made by :') +
        "\n Amaury Deflorenne <https://github.com/AmauryD>" +
        "\n Romain Verliefden <https://github.com/DramixDW>" +
        "\n Samuel Antoine <https://github.com/Snorkell>"
    );
};
