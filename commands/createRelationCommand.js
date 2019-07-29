/**
 * @module createRelationCommand
 * @description Command module to handle creating relation between 2 models
 * @author Deflorenne Amaury
 */

// Project imports
const commandUtils = require('./commandUtils');
const migrateAction = require('../actions/migrateAction');
const createRelationAction = require('../actions/createRelationAction');
const Log = require('../utils/log');
const {format} =require('../actions/lib/utils');

//node modules
const {Spinner} = require('clui');
const chalk = require('chalk');
const {singular} =require('pluralize');


/**
 * Yargs command syntax
 * @type {string}
 */
exports.command = 'addRelationship <relation> <model1> <model2>';

/**
 * Aliases for Yargs command
 * @type {string[]}
 */
exports.aliases = ['ar', 'addR'];

/**
 * Command description
 * @type {string}
 */
exports.describe = 'Create  relation between two table\n Available relation:\n- mtm (ManyToMany)\n- mto (ManyToOne)\n- otm (OneToMany)\n- oto (OneToOne)';

/**
 * Handle and build command options
 * @param yargs
 */
exports.builder = (yargs) => {
    yargs.option('name', {
        desc: "Specify the name of foreign key (for Oto) or the name of the bridging table (for Mtm)",
        type: "string",
        default: null
    });
    yargs.option('refCol', {
        desc: "Specify referenced column for a oto relation",
        type: "string",
        default: null
    });
    yargs.option('m1Name', {
        desc: "Specify the name of the column for the first model",
        type: "string",
        default: null
    });
    yargs.option('m2Name', {
        desc: "Specify the name of the column for the second model",
        type: "string",
        default: null
    });
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    let relations=['mtm','mto','otm','oto'];

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();
    await commandUtils.checkConnectToDatabase();

    const model1 = format(argv.model1);
    const model2 = format(argv.model2);
    const relation = argv.relation;
    const name = argv.name;
    const refCol = argv.refCol;
    let m1Name,m2Name;
    argv.m1Name ? m1Name = singular(format(argv.m1Name)) : m1Name = model1;
    argv.m2Name ? m2Name = singular(format(argv.m2Name)) : m2Name = model2;

    if(!relations.includes(relation)){
        Log.error('Wrong relation');
        Log.info('Available relation:\n- mtm (ManyToMany)\n- mto (ManyToOne)\n- otm (OneToMany)\n- oto (OneToOne)');
        process.exit(0)
    }

    await createRelationAction(model1, model2, relation, name, refCol , m1Name , m2Name)
        .then(async () => {
            Log.success("Relation successfully added !");
            const spinner = new Spinner("Generating and executing migration");
            spinner.start()
            await migrateAction(`${model1}-${model2}`)
                .then((generated) => {
                    spinner.stop();
                    const [migrationDir] = generated;
                    Log.success(`Executed migration successfully`);
                    Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
                })
                .catch((e) => {
                    spinner.stop();
                    Log.error(e.message);
                });
        })
        .catch((err) => Log.error(err.message));
    process.exit(0);    
};
