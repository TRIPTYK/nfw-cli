/**
 * @module removeRelationAction
 * @author Verliefden Romain
 * @description removes relation between 2 models
 */

// node modules
const pluralize = require('pluralize');

// project modules
const utils = require('./lib/utils');
const removeFromModel = require('./lib/removeFromModel');
const sql = require('../database/sqlAdaptator');
const Log = require('../utils/log');
const migrate = require('./migrateAction');
const {format} =require('../actions/lib/utils');

/**
 * Main function
 * @param {string} model1
 * @param {string} model2
 * @returns {Promise<void>}
 */
module.exports = async (model1, model2) => {
    model1 = format(model1);
    model2 = format(model2);

    let mod1plural = false;
    let mod2plural = false;

    if(!utils.modelFileExists(model1) ||!utils.modelFileExists(model1)){
        throw new Error('Both model should exist in order to remove a relation between them');
    }

    if (utils.relationExist(model1, pluralize.plural(model2))) mod2plural = true;
    if (utils.relationExist(model2, pluralize.plural(model1))) mod1plural = true;

    if (mod2plural) model2 = pluralize.plural(model2);
    if (mod1plural) model1 = pluralize.plural(model1);

    -   await Promise.all([removeFromModel(model1, model2, true), removeFromModel(model2, model1,true)]).then(async() =>{
        if(mod1plural && mod2plural) await sql.DropBridgingTable(model1,model2).catch((e) => Log.error(e.message));
        else await migrate(`${model1}-${model2}`);
    });
};