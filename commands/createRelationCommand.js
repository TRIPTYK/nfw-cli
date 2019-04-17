/**
 * node modules imports
 */

/**
 * project imports
 */
const commandUtils = require('./commandUtils');
const sqlAdaptor = require('../database/sqlAdaptator');
const migrateAction = require('../actions/migrateAction');
const createRelationAction = require('../actions/createRelationAction');
const Log = require('../utils/log');

exports.command = 'addRelationship <relation> <model1> <model2>';
exports.aliases = ['ar', 'addR'];

exports.describe = 'Create  relation between two table';

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

exports.handler = async (argv) => {
    commandUtils.validateDirectory();
    await sqlAdaptor.checkConnexion();

    const model1 = argv.model1;
    const model2 = argv.model2;
    const relation = argv.relation;
    const name = argv.name;
    const refCol = argv.refCol;

    let migrate = true;

    createRelationAction(model1, model2, relation, name, refCol)
        .then(() => Log.success("Relation successfully added !"))
        .catch((err) => {
            migrate = false;
            Log.error(err.message)
        });

    if (migrate) migrateAction(`${model1}-${model2}`);
};
