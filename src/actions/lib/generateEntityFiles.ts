/**
 * @module generateEntityFiles
 * @description Generate entity files except model
 * @author Deflorenne Amaury
 * @author Verliefden Romain
 * @author Sam Antoine
 */

// node modules
import FS = require('fs');
import ejs = require('ejs');
import project = require('../../utils/project');

// project modules
import Log = require('../../utils/log');
import {capitalizeEntity, lowercaseEntity} from './utils';

// false class properties
let capitalize;
let lowercase;

import controllerTemplateFile = require('../../templates/controller');
import relationsTemplateFile = require('../../templates/relations');
import repositoryTemplateFile = require('../../templates/repository');
import serializerTemplateFile = require('../../templates/serializer');
import validationTemplateFile = require('../../templates/validation');
import schemaTemplateFile = require('../../templates/schema');
import typeTemplateFile = require('../../templates/types');
import testTemplateFile = require('../../templates/test');


//Check entity existence, and write file or not according to the context
export async function main (modelName: string, crudOptions: object, data = null, part?: string): Promise<void> {

    if (!modelName.length) {
        Log.error('Nothing to generate. Please, get entity name parameter.');
        return;
    }

    // assign false class properties
    lowercase = lowercaseEntity(modelName);
    capitalize = capitalizeEntity(modelName);

    let tableColumns, foreignKeys;
    tableColumns = data ? data.columns : [];
    foreignKeys = data ? data.foreignKeys : [];

    let index = tableColumns.findIndex(el => el.Field === 'id');
    // remove id key from array
    if (index !== -1) tableColumns.splice(tableColumns, 1);

    const allColumns = tableColumns // TODO: do this in view
        .map(elem => `'${elem.Field}'`)
        .concat(foreignKeys.map(e => `'${e.COLUMN_NAME}'`));

    if (data.createUpdate != null && data.createUpdate.createAt) allColumns.push(`'createdAt'`);
    if (data.createUpdate != null && data.createUpdate.updateAt) allColumns.push(`'updatedAt'`);

    const files = [];
    const controllerPath = `src/api/controllers/${lowercase}.controller.ts`;
    const validationPath = `src/api/validations/${lowercase}.validation.ts`;
    const relationPath = `src/api/enums/json-api/${lowercase}.enum.ts`;
    const repositoryPath = `src/api/repositories/${lowercase}.repository.ts`;
    const serializerPath = `src/api/serializers/${lowercase}.serializer.ts`;
    const schemaPath = `src/api/serializers/schemas/${lowercase}.schema.ts`;
    const typePath = `src/api/serializers/schemas/types.ts`;
    const testPath = `test/${lowercase}.test.ts`;

        
    typeTemplateFile(typePath, lowercase);

    if (!part || part === 'controller')
        files.push(controllerTemplateFile.main(controllerPath,{
            className : `${capitalize}Controller`,
            options : crudOptions,
            entityName : lowercase
        }));

    if (!part || part === 'relation')
        files.push(relationsTemplateFile(relationPath,{
            entityName : lowercase,
            columns: tableColumns
        }));

    if (!part || part === 'repository')
        files.push(repositoryTemplateFile(repositoryPath,{
            className : `${capitalize}Repository`,
            entityName : lowercase
        }));

    if (!part || part === 'validation')
        files.push(validationTemplateFile(validationPath,{
            options : crudOptions,
            entityName : lowercase,
            entities : tableColumns
        }));

    if(!part || part === 'schema')
        files.push(schemaTemplateFile(schemaPath, {
            className: `${capitalize}Schema`,
            entityName: lowercase
        }));

    if (!part || part === 'serializer')
        files.push(serializerTemplateFile(serializerPath,{
            className : `${capitalize}Serializer`,
            entityName : lowercase,
            //columns : tableColumns
        }));

    // auto generate imports
    files.forEach(file => {
        file.fixMissingImports();
        Log.success(`Created ${file.getFilePath()}`);
    });

    /** 
    if (!part || part === 'test') {
        testTemplateFile(testPath);
    }**/

    await project.save();
};