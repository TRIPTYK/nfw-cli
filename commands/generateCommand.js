/**
 * @module generateCommand
 * @description Command module to handle dynamic entity files generation for the boilerplate
 * @author Deflorenne Amaury
 */

// Node modules imports
const reservedWords = require('reserved-words');
const { Spinner } = require('clui');
const chalk = require('chalk');

// Project imports
const commandUtils = require('./commandUtils');
const generateAction = require('../actions/generateAction');
const migrateAction = require('../actions/migrateAction');
const generateDocAction = require('../actions/generateDocumentationAction');
const Log = require('../utils/log');


const generateDocSpinner = new Spinner('Generating documentation');


/**
 * Yargs command
 * @type {string}
 */
exports.command = 'generate <modelName> [CRUD]';

/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['gen', 'g'];

/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generate a new model';

/**
 * Yargs command builder
 * @param yargs
 */
exports.builder = (yargs) => {
    yargs.default('CRUD', 'CRUD');
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    const modelName = argv.modelName;
    const crud = argv.CRUD;

    commandUtils.validateDirectory();
    await commandUtils.checkConnectToDatabase();

    if (await reservedWords.check(modelName, 6)) {
        console.log("modelName is a reserved word");
        process.exit(0);
    }

    let crudOptions = {
        create: true,
        read: true,
        update: true,
        delete: true
    };
    
    if ((/^[crud]{1,4}$/).test(crud)) {
        crudOptions.create = crud.includes('c');
        crudOptions.read = crud.includes('r');
        crudOptions.update = crud.includes('u');
        crudOptions.delete = crud.includes('d');
    }

    await generateAction(modelName, crudOptions);

    const spinner = new Spinner("Generating and executing migration");
    spinner.start();

    await migrateAction(modelName)
        .then((generated) => {
            const [migrationDir] = generated;
            spinner.stop();
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            Log.error(e.message);
            process.exit();
        });


    generateDocSpinner.start();

    await generateDocAction()
        .then(() => {
            Log.success('Typedoc generated successfully');
        })
        .catch((e) => {
            Log.error('Typedoc failed to generate : ' + e.message);
        });

    generateDocSpinner.stop();

    process.exit();
};