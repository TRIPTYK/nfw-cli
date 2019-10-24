/**
 * @module migrateCommmand
 * @description Command module to execute migration of a model
 * @author Deflorenne Amaury
 */


// Node modules
const reservedWords = require('reserved-words');
const {Spinner} = require('clui');
const chalk = require('chalk');


// Project imports
const commandUtils = require('./commandUtils');
const Log = require('../utils/log');
const migrateAction = require('../actions/migrateAction');
const utils = require('../actions/lib/utils');

/**
 * Yargs command
 * @type {string}
 */
exports.command = 'migrate <migrateName>';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ["mig", "M"];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generate, compile and run the migration';

/**
 * Yargs command builder
 */
exports.builder = (yargs) => {
    yargs.check(_validateArgs);
    yargs.option('restore', {
        desc: "Restore migration data at a specific state",
        type: "boolean",
        default: false
    });
    yargs.option('revert', {
        desc: "Revert migration at a specific state",
        type: "boolean",
        default: false
    });
    yargs.option('dump',{
        desc :'dump', 
        type : "boolean",
        default : false
    });
};

/**
 * 
 * @param argv
 * @param options
 * @return {boolean}
 */
const _validateArgs = (argv,options) => {
    if (!utils.isAlphanumeric(argv.migrateName)) throw new Error("<migrateName> is non alphanumeric");
    if (reservedWords.check(argv.migrateName, 6)) throw new Error("<migrateName> is a reserved word");
    return true;
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const modelName = argv.migrateName;
    const restore = argv.restore;
    const dump = argv.dump ;
    const revert = argv.revert;
    const spinner = new Spinner("Generating and executing migration");

    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();

    spinner.start();

    await migrateAction(modelName,restore,dump,revert)
        .then((generated) => {
            const [migrationDir] = generated;
            spinner.stop(true);
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            spinner.stop(true);
            console.log(e)
            Log.error(e.message);
        });

    process.exit(0);
};
