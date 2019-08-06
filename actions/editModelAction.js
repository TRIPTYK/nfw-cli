/**
 * @author Verliefden Romain
 * @module editModelAction
 * @description Edit a model
 */

// project modules
const removeFromModel = require('./lib/removeFromModel');
const addInModels = require('./lib/addInModel');
const modelSpecs = require('./lib/modelSpecs');
const Log = require('../utils/log');
const {format} = require('../actions/lib/utils');
const project = require('../utils/project');


/**
 * Main function
 * @param {string} action
 * @param {string} model Model name
 * @param {string|null} column Column name
 * @returns {Promise<void>}
 */
module.exports = async (action, model, column = null) => {
    model = format(model);

    if (action === 'remove') {
        removeFromModel.removeFromSerializer(model, column, ' ', false);
        removeFromModel.removeRelationFromModelFile(model, column);

        await removeFromModel.removeFromTest(model, column);
        removeFromModel.removeFromValidation(model, column);

        Log.success('Column successfully removed');
        await project.save();
    }

    if (action === 'add') {
        let data = await modelSpecs.newColumn(column);
        await addInModels(model, data)
            .then(() =>{
                Log.success('Column successfully added');
            });

        await project.save();
    }
};