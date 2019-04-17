/**
 * node modules
 */
const chalk = require('chalk');
const clearConsole = require('clear');

/**
 * Project imports
 */
const newAction = require('../actions/newAction');

exports.command = 'new';
exports.aliases = ['n'];

exports.describe = 'Generate a new project';

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

exports.handler = (argv) => {
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

    newAction(name, defaultEnv, useDifferentPath, setupDocker, useYarn);
};
