/**
 * @module generateEntityFiles
 * @description Generate entity files except model
 * @author Deflorenne Amaury
 * @author Verliefden Romain
 * @author Sam Antoine
 */

// node modules
const FS = require('fs');
const ejs = require('ejs');
const project = require('../../utils/project');

// project modules
const Log = require('../../utils/log');
const writeToRouter = require('./routerWrite');
const {capitalizeEntity, lowercaseEntity} = require('./utils');

// false class properties
let capitalize;
let lowercase;

const controllerTemplateFile = require(`../../templates/controller`);
const middlewareTemplateFile = require(`../../templates/middleware`);
const relationsTemplateFile = require(`../../templates/relations`);
const repositoryTemplateFile = require(`../../templates/repository`);
const routeTemplateFile = require(`../../templates/route`);
const serializerTemplateFile = require(`../../templates/serializer`);
const validationTemplateFile = require(`../../templates/validation`);
const testTemplateFile = require(`../../templates/test`);

/**
 * Main function
 * Check entity existence, and write file or not according to the context
 *
 * @param {string} modelName
 * @param {object} crudOptions
 * @param {object|null} data
 * @returns {Promise<void>}
 */
module.exports = async (modelName, crudOptions, data = null,part) => {
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
        files.push(controllerTemplateFile(controllerPath,{
            className : `${capitalize}Controller`,
            options : crudOptions,
            entityName : lowercase
        }));

    if (!part || part === 'middleware')
        files.push(middlewareTemplateFile(middlewarePath,{
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
            columns : tableColumns
        }));

    if (!part || part === 'route') {
        files.push(routeTemplateFile(routerPath, {
            options: crudOptions,
            entityName: lowercase
        }));
        await writeToRouter(lowercase);
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