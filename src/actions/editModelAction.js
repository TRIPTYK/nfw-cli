/**
 * @author Verliefden Romain
 * @module editModelAction
 * @description Edit a model
 */

// node modules
const stringifyObject = require('stringify-object');

// project modules
const removeFromModel = require('./lib/removeFromModel');
const addInModels = require('./lib/addInModel');
const modelSpecs = require('./lib/modelSpecs');
const Log = require('../utils/log');
const {format , lowercaseEntity , buildModelColumnArgumentsFromObject , columnExist } = require('../actions/lib/utils');
const project = require('../utils/project');
const chalk = require('chalk');

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
    }

    if (action === 'add') {
        let data = await modelSpecs.newColumn(column);

        let pathModel = `src/api/models/${lowercaseEntity(model)}.model.ts`;
        if (data === null) throw  new Error('Column cancelled');
        if (columnExist(model, data.columns.Field)) throw  new Error('Column already exist');

        let entity = data.columns;

        project.getSourceFile(pathModel).getClasses()[0].addProperty({name : data.columns.Field }).addDecorator({
            name : 'Column' , arguments : stringifyObject(buildModelColumnArgumentsFromObject(entity))
        }).setIsDecoratorFactory(true);

        addInModels.writeSerializer(model, data.columns.Field);
        addInModels.addToValidations(model, data.columns);
        //await addInModels.addToTest(model,data.columns);

        Log.info(`Column generated in ${chalk.cyan(`src/api/models/${lowercaseEntity(model)}.model.ts`)}`);
    }

    await project.save();
};