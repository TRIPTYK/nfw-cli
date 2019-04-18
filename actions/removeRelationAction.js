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
    if (utils.columnExist(model1, pluralize.plural(model2))) mod2plural = true;
    if (utils.columnExist(model2, pluralize.plural(model1))) mod1plural = true;

    if (mod2plural) model2 = pluralize.plural(model2);
    if (mod1plural) model1 = pluralize.plural(model1);

    console.log(model1,model2);
    await Promise.all([removeFromModel(model1, model2), removeFromModel(model2, model1)]);
    if(mod1plural && mod2plural) await sql.DropBridgingTable(model1,model2);
    else await migrate(`${model1}-${model2}`);
    Log.success('Relation removed');
    process.exit(0);
};