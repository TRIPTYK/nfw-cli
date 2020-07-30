"use strict";
/**
 * @module infoCommand
 * @description Command module to display project information
 * @author Deflorenne Amaury
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.builder = exports.describe = exports.aliases = exports.command = void 0;
// Node modules
var chalk_1 = require("chalk");
//yargs command
exports.command = 'info';
//yargs command aliases
exports.aliases = ['i'];
//yargs command desc
exports.describe = 'Show the information about the developers';
//yargs command builder
function builder() {
}
exports.builder = builder;
;
//main function
function handler() {
    console.log(chalk_1.default.bgGreen('Made by :') +
        "\n Amaury Deflorenne <https://github.com/AmauryD>" +
        "\n Romain Verliefden <https://github.com/DramixDW>" +
        "\n Samuel Antoine <https://github.com/Snorkell>");
}
exports.handler = handler;
;
