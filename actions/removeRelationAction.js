/**
 * @module removeRelationAction
 * @author Verliefden Romain
 * @description removes relation between 2 models
 */

// node modules
const pluralize = require('pluralize');
const {Spinner} = require('clui');
const chalk = require('chalk');

// project modules
const utils = require('./lib/utils');
const removeFromModel = require('./lib/removeFromModel');
const { getSqlConnectionFromNFW } = require('../database/sqlAdaptator');
const Log = require('../utils/log');
const migrate = require('./migrateAction');
const {format} =require('../actions/lib/utils');

/**
 * Main function
 * @param {string} model1
 * @param {string} model2
 * @returns {Promise<void>}
 */
module.exports = async (model1, model2,m1Name,m2Name) => {
    model1 = format(model1);
    model2 = format(model2);
    const sql = await getSqlConnectionFromNFW();

    let mod1plural = false;
    let mod2plural = false;

    if(!utils.modelFileExists(model1) ||!utils.modelFileExists(model2)){
        throw new Error('Both model should exist in order to remove a relation between them');
    }

    if (utils.relationExist(model1, pluralize.plural(m2Name))) mod2plural = true;
    if (utils.relationExist(model2, pluralize.plural(m1Name))) mod1plural = true;

    if (mod2plural) m2Name = pluralize.plural(m2Name);
    if (mod1plural) m1Name = pluralize.plural(m1Name);




    await Promise.all([removeFromModel(model1, m2Name, true,model2), removeFromModel(model2, m1Name, true,model1)]).then(async () => {
        if (mod1plural && mod2plural) await sql.dropBridgingTable(model1, model2).catch((e) => Log.error(e.message));
        else {
            const spinner = new Spinner("Generating and executing migration");
            spinner.start();
            await migrate(`${model1}-${model2}`)
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
        }
    });
};