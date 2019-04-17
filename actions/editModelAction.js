const removeColumn = require('./lib/removeFromModel');
const modelWrite = require('./writeModelAction');
const modelSpecs = require('./lib/modelSpecs');
const Log = require('../utils/log');

module.exports = async (action, model, column = null) => {
    if (action === 'remove') await removeColumn(model, column)
        .then(() => Log.success('Column successfully removed'))
        .catch(err => Log.error(err.message));

    if (action === 'add') {
        let data = await modelSpecs.newColumn();
        await modelWrite.addColumn(model, data)
            .then(() => Log.success('Column successfully added'))
            .catch(err => Log.error(err));
    }
    process.exit(0);
};