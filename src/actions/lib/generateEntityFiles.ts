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
import writeToRouter = require('./routerWrite');
import {capitalizeEntity, lowercaseEntity} from './utils';

// false class properties
let capitalize;
let lowercase;

import controllerTemplateFile = require('../../templates/controller');
import middlewareTemplateFile = require('../../templates/middleware');
import relationsTemplateFile = require('../../templates/relations');
import repositoryTemplateFile = require('../../templates/repository');
import routeTemplateFile = require('../../templates/route');
import serializerTemplateFile = require('../../templates/serializer');
import validationTemplateFile = require('../../templates/validation');
import testTemplateFile = require('../../templates/test');

/**
 * Main function
 * Check entity existence, and write file or not according to the context
 *
 * @param {string} modelName
 * @param {object} crudOptions
 * @param {object|null} data
 * @returns {Promise<void>}
 */
export async function main (modelName: string, crudOptions: object, data = null, part: string): Promise<void> {

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
    const middlewarePath = `src/api/middlewares/${lowercase}.middleware.ts`;
    const validationPath = `src/api/validations/${lowercase}.validation.ts`;
    const relationPath = `src/api/enums/json-api/${lowercase}.enum.ts`;
    const repositoryPath = `src/api/repositories/${lowercase}.repository.ts`;
    const serializerPath = `src/api/serializers/${lowercase}.serializer.ts`;
    const routerPath = `src/api/routes/v1/${lowercase}.route.ts`;
    const testPath = `test/${lowercase}.test.ts`;

    if (!part || part === 'controller')
        files.push(controllerTemplateFile.main(controllerPath,{
            className : `${capitalize}Controller`,
            options : crudOptions,
            entityName : lowercase
        }));

    if (!part || part === 'middleware')
        files.push(middlewareTemplateFile.main(middlewarePath,{
            className : `${capitalize}Middleware`,
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

    if (!part || part === 'serializer')
        files.push(serializerTemplateFile(serializerPath,{
            className : `${capitalize}Serializer`,
            entityName : lowercase,
            //columns : tableColumns
        }));

    if (!part || part === 'route') {
        files.push(routeTemplateFile(routerPath, {
            options: crudOptions,
            entityName: lowercase
        }));
        await writeToRouter.main(lowercase);
    }

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