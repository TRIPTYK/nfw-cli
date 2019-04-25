/**
 * @module newCommand
 * @description Command module to handle generation of a new project
 * @author Deflorenne Amaury
 */

// Node modules
const chalk = require('chalk');
const clearConsole = require('clear');

// Project imports
const newAction = require('../actions/newAction');
const Log = require('../utils/log');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'new';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['n'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generate a new project';

/**
 * Yargs command builder
 * @param yargs
 */
exports.builder = (yargs) => {
    yargs.option('default', {
        desc: "Generate a project with default env variables",
        type: "boolean",
        default: false
    });
    yargs.option('path', {
        desc: "Allow the user to choose a different path",
        type: 'boolean',
        default: false
    });
    yargs.option('docker', {
        desc: "Set a mysql container up",
        type: 'boolean',
        default: false
    });
    yargs.option('yarn', {
        desc: "Set yarn as package manager",
        type: 'boolean',
        default: false
    });
};

/**
 * Main function
 * @param argv
 */
exports.handler = async (argv) => {
    const name = argv._[1];
    const defaultEnv = argv.default;
    const useDifferentPath = argv.path;
    const setupDocker = argv.docker;
    const useYarn = argv.yarn;

    clearConsole();

    if (name === undefined) {
        console.log(chalk.red('Please provide a name for your application'));
        process.exit(0);
    }

    await newAction(name, !defaultEnv, useDifferentPath, setupDocker, useYarn)
        .then(() => {
            Log.success("New project generated successfully");
            Log.info("Don't forget to use the migrate command before starting your server");
        })
        .catch((e) => {
            Log.error("Error when generating new project : " + e.message);
        });

    process.exit();
};
