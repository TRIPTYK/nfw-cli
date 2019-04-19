const removeColumn = require('./lib/removeFromModel');
const modelWrite = require('./writeModelAction');
const modelSpecs = require('./lib/modelSpecs');
const Log = require('../utils/log');
const migrate = require('./migrateAction');
const {format} =require('../actions/lib/utils');

module.exports = async (action, model, column = null) => {
    model = format(model);
    if (action === 'remove') await removeColumn(model, column,false)
        .then(() => Log.success('Column successfully removed'))
        .catch(err => Log.error(err.message));

    if (action === 'add') {
        let data = await modelSpecs.newColumn();
        await modelWrite.addColumn(model, data)
            .then(() => Log.success('Column successfully added'))
            .catch(err => Log.error(err));
    }
    await migrate(`${action}-in-${model}`)
    process.exit(0);
};