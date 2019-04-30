/**
 * @module newCommand
 * @description Command module to handle generation of a new project
 * @author Deflorenne Amaury
 */

// Node modules
const chalk = require('chalk');
const clearConsole = require('clear');
const { Spinner } = require('clui');

// Project imports
const newAction = require('../actions/newAction');
const migrateAction = require('../actions/migrateAction');
const createSuperUserAction = require('../actions/createSuperUserAction');
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

    // process cwd is changed in newAction to the new project folder
    await newAction(name, !defaultEnv, useDifferentPath, setupDocker, useYarn)
        .then(() => {
            Log.success("New project generated successfully");
        })
        .catch((e) => {
            Log.error("Error when generating new project : " + e.message);
            process.exit();
        });

    const migrationSpinner = new Spinner("Executing migration ...");
    migrationSpinner.start();

    await migrateAction("init_project")
        .then((generated) => {
            const [migrationDir] = generated;
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            Log.error("Failed to execute migration : " + e.message);
        });

    migrationSpinner.stop();

    await createSuperUserAction("admin")
        .then((generated) => {
            const [ filePath ] = generated;

            Log.info(`Created ${filePath}`);

            console.log(
                chalk.bgYellow(chalk.black('/!\\ WARNING /!\\ :')) +
                `\nA Super User named ${chalk.red('admin')} has been generated for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsibility to change this password to your own password`
            );
        })
        .catch((e) => {
            Log.error("Failed to create super user : " + e.message);
        });

    process.exit();
};
