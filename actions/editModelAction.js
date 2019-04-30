/**
 * @author Verliefden Romain
 * @module editModelAction
 * @description Edit a model
 */

// project modules
const removeColumn = require('./lib/removeFromModel');
const addInModels = require('./lib/addInModel');
const modelSpecs = require('./lib/modelSpecs');
const Log = require('../utils/log');
const {format} = require('../actions/lib/utils');


/**
 * Main function
 * @param {string} action
 * @param {string} model Model name
 * @param {string|null} column Column name
 * @returns {Promise<void>}
 */
module.exports = async (action, model, column = null) => {
    model = format(model);

    if (action === 'remove')
        await removeColumn(model, column, false)
            .then(async () => {
                Log.success('Column successfully removed');
            });

    if (action === 'add') {
        let data = await modelSpecs.newColumn(column);
        await addInModels(model, data)
            .then(async () =>{
                Log.success('Column successfully added');

            });
    }
};