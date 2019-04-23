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
const {format} =require('../actions/lib/utils');

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

    const model1 = format(argv.model1);
    const model2 = format(argv.model2);
    const relation = argv.relation;
    const name = argv.name;
    const refCol = argv.refCol;

    await createRelationAction(model1, model2, relation, name, refCol)
        .then(async () => {
            Log.success("Relation successfully added !");
            await migrateAction(`${model1}-${model2}`)
                .then((generated) => {
                    const [migrationDir] = generated;
                    Log.success(`Executed migration successfully`);
                    Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
                })
                .catch((e) => {
                    Log.error(e.message);
                });
        })
        .catch((err) => Log.error(err.message));
};
