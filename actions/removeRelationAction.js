const pluralize = require('pluralize');
const utils = require('./lib/utils');
const removeFromModel = require('./lib/removeFromModel');

module.exports = async (model1, model2) => {
    model1 = utils.lowercaseEntity(model1);
    model2 = utils.lowercaseEntity(model2);

    let mod1plural = null;
    let mod2plural = null;

    if (await utils.columnExist(model1, model2)) mod2plural = false;
    if (await utils.columnExist(model2, model1)) mod1plural = false;
    if (await utils.columnExist(model1, pluralize.plural(model2))) mod2plural = true;
    if (await utils.columnExist(model2, pluralize.plural(model1))) mod1plural = true;

    if (mod2plural) model2 = pluralize.plural(model2);
    if (mod1plural) model1 = pluralize.plural(model1);

    if (mod1plural === null || mod2plural === null) {
        Log.error('relation doesn\'t exist or exist only in one of the model\n If it exist only in one model, use editModel remove');
        process.exit(0);
    }

    await Promise.all([removeFromModel(model1, model2), removeFromModel(model2, model1)]);
    Log.success('Relation removed');
    process.exit(0);
};