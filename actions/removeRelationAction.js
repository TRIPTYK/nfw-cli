const pluralize = require('pluralize');
const utils = require('./lib/utils');
const removeFromModel = require('./lib/removeFromModel');
const sql = require('../database/sqlAdaptator')
const Log = require('../utils/log');
const migrate = require('./migrateAction')
const {format} =require('../actions/lib/utils');


module.exports = async (model1, model2) => {
    model1 = format(model1);
    model2 = format(model2);

    let mod1plural = false;
    let mod2plural = false;

    if(!utils.modelFileExists(model1) ||!utils.modelFileExists(model1)){
        Log.error('Both model should exist in order to remove a relation between them');
        process.exit(0);
    }


    if (utils.relationExist(model1, pluralize.plural(model2))) mod2plural = true;
    if (utils.relationExist(model2, pluralize.plural(model1))) mod1plural = true;

    if (mod2plural) model2 = pluralize.plural(model2);
    if (mod1plural) model1 = pluralize.plural(model1);

-   await Promise.all([removeFromModel(model1, model2, true), removeFromModel(model2, model1,true)]).then(async() =>{
        if(mod1plural && mod2plural) await sql.DropBridgingTable(model1,model2).catch((e) => Log.error(e.message));
        else await migrate(`${model1}-${model2}`);
    });
    Log.success('Relation removed');
    process.exit(0);
};