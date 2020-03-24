/**
 * @author Verliefden Romain
 * @module editModelAction
 * @description Edit a model
 */

// node modules
import stringifyObject = require('stringify-object');

// project modules
import removeFromModel = require('./lib/removeFromModel');
import addInModels = require('./lib/addInModel');
import modelSpecs = require('./lib/modelSpecs');
import Log = require('../utils/log');
import {format , lowercaseEntity , buildModelColumnArgumentsFromObject , columnExist } from '../actions/lib/utils';
import project = require('../utils/project');
import chalk from 'chalk';

/**
 * Main function
 * @param {string} action
 * @param {string} model Model name
 * @param {string|null} column Column name
 * @returns {Promise<void>}
 */

export class EditModelClass {

    action: string;
    model: string;
    column: string;

    constructor(action: string, model: string, column: string = null){
        
        this.action = action;
        this.model = model;
        this.column = column;
    }

    async main (): Promise<void> {

        this.model = format(this.model);
    
        if (this.action === 'remove') {
            removeFromModel.removeFromSerializer(this.model, this.column, ' ', false);
            removeFromModel.removeRelationFromModelFile(this.model, this.column);
    
            //await removeFromModel.removeFromTest(model, column);
            removeFromModel.removeFromValidation(this.model, this.column);
    
            Log.success('Column successfully removed');
        }
    
        if (this.action === 'add') {
            let data: any = await modelSpecs.newColumn(this.column);
    
            let pathModel = `src/api/models/${lowercaseEntity(this.model)}.model.ts`;
            if (data === null) throw  new Error('Column cancelled');
            if (columnExist(this.model, data.columns.Field)) throw  new Error('Column already exist');
    
            let entity = data.columns;
    
            project.getSourceFile(pathModel).getClasses()[0].addProperty({name : data.columns.Field }).addDecorator({
                name : 'Column' , arguments : stringifyObject(buildModelColumnArgumentsFromObject(entity)) as any
            }).setIsDecoratorFactory(true);
    
            addInModels.writeSerializer(this.model, data.columns.Field);
            addInModels.addToValidations(this.model, data.columns);
            //await addInModels.addToTest(model,data.columns);
    
            Log.info(`Column generated in ${chalk.cyan(`src/api/models/${lowercaseEntity(this.model)}.model.ts`)}`);
        }
    
        await project.save();
    };
}



