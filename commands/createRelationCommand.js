/**
 * @module createRelationCommand
 * @description Command module to handle creating relation between 2 models
 * @author Deflorenne Amaury
 */

// Project imports
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const migrateAction = require('../actions/migrateAction');
const createRelationAction = require('../actions/createRelationAction');
const Log = require('../utils/log');
const {format} =require('../actions/lib/utils');

const {Spinner} = require('clui');
const chalk = require('chalk');

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
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = async (argv) => {
    relations=['mtm','mto','otm','oto'];
    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();

    const model1 = format(argv.model1);
    const model2 = format(argv.model2);
    const relation = argv.relation;
    const name = argv.name;
    const refCol = argv.refCol;

    if(!relations.includes(relation)){
        Log.error('Wrong relation');
        Log.info('Available relation:\n- mtm (ManyToMany)\n- mto (ManyToOne)\n- otm (OneToMany)\n- oto (OneToOne)');
        process.exit(0)
    }

    await createRelationAction(model1, model2, relation, name, refCol)
        .then(async () => {
            Log.success("Relation successfully added !");
        })
        .catch((err) => Log.error(err.message));
    process.exit(0);    
};
