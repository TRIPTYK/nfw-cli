/**
 * @module writeModelAction
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 * @description this module write the model.ts based on columns of the database
 * if the table exist. If the table doesn't exist , the user enter the columns of
 * the future table and the table is created in the database.
 */
import project = require('../utils/project');
import modelTemplateFile from '../templates/model';
import kebabCase from '@queso/kebab-case'

//action: modelName
//Description : write a typeorm model from an array of info about an entity
export async function writeModel (modelName: string, data = null, dbType: string): Promise<void> {
    let {columns, foreignKeys} = data;
 
    /*
         filter the foreign keys from columns , they are not needed anymore
         Only when imported by database
    */
    columns = columns.filter(column => {
        return foreignKeys.find(elem => elem.COLUMN_NAME === column.Field) === undefined;
    }).filter(col => col.Field !== "id");

    
    modelTemplateFile(`src/api/models/${kebabCase(modelName)}.model.ts`,modelName,{
        entities : columns
    }, dbType);

    await project.save();
};


//Description : creates a basic model , with no entites , imports or foreign keys
export async function basicModel (modelName: string, dbType: string) {

    modelTemplateFile(`src/api/models/${kebabCase(modelName)}.model.ts`,modelName,{
        entities : []
    }, dbType);

    await project.save();
};