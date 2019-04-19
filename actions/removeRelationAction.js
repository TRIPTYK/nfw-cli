const pluralize = require('pluralize');
const utils = require('./lib/utils');
const removeFromModel = require('./lib/removeFromModel');
const sql = require('../database/sqlAdaptator')
const Log = require('../utils/log');
const snake = require('to-snake-case');
const migrate = require('./migrateAction')

module.exports = async (model1, model2) => {
    model1 = snake(model1);
    model2 = snake(model2);

    let mod1plural = false;
    let mod2plural = false;


    if (utils.relationExist(model1, pluralize.plural(model2))) mod2plural = true;
    if (utils.relationExist(model2, pluralize.plural(model1))) mod1plural = true;

    if (mod2plural) model2 = pluralize.plural(model2);
    if (mod1plural) model1 = pluralize.plural(model1);

<<<<<<< HEAD
-   await Promise.all([removeFromModel(model1, model2, true), removeFromModel(model2, model1,true)]);
    if(mod1plural && mod2plural) await sql.DropBridgingTable(model1,model2).catch((e) => Log.error(e.message));
    else await migrate(`${model1}-${model2}`);
=======
    if (mod1plural === null || mod2plural === null) {
        Log.error('relation doesn\'t exist or exist only in one of the model\n If it exist only in one model, use editModel remove');
        process.exit(0);
    }

    await Promise.all([removeFromModel(model1, model2), removeFromModel(model2, model1)]);
>>>>>>> b485bb1e758f834f14a952ad6b0518cf5740e96f
    Log.success('Relation removed');
    process.exit(0);
};