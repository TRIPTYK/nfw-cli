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

/**
 * Generate files from EJS templates , model generation is handled in another file
 * @param {object} data
 * @param {object} crudOptions
 * @returns {Promise<void>}
 */
const _write = async (data, crudOptions) => {
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
    const relationPath = `src/api/enums/relations/${lowercase}.relations.ts`;
    const repositoryPath = `src/api/repositories/${lowercase}.repository.ts`;
    const serializerPath = `src/api/serializers/${lowercase}.serializer.ts`;
    const routerPath = `src/api/routes/v1/${lowercase}.route.ts`;

    files.push(controllerTemplateFile(controllerPath,{
        className : `${capitalize}Controller`,
        options : crudOptions,
        entityName : lowercase
    }));

    files.push(middlewareTemplateFile(middlewarePath,{
        className : `${capitalize}Middleware`,
        entityName : lowercase
    }));

    files.push(relationsTemplateFile(relationPath,{
        foreignKeys
    }));

    files.push(repositoryTemplateFile(repositoryPath,{
        className : `${capitalize}Repository`,
        entityName : lowercase
    }));

    files.push(validationTemplateFile(validationPath,{
        options : crudOptions,
        entityName : lowercase,
        entities : tableColumns
    }));

    files.push(serializerTemplateFile(serializerPath,{
        className : `${capitalize}Serializer`,
        entityName : lowercase,
        columns : tableColumns
    }));

    files.push(routeTemplateFile(routerPath,{
        options : crudOptions,
        entityName : lowercase
    }));

    // auto generate imports
    files.forEach(file => {
        file.fixMissingImports();
        Log.success(`Created ${file.getFilePath()}`);
    });

    // Tests are easier to do in EJS template
    let file = FS.readFileSync(`${__baseDir}/templates/test.ejs`, 'utf-8');

    let output = ejs.compile(file)({
        entityLowercase: lowercase,
        entityCapitalize: capitalize,
        options: crudOptions,
        tableColumns,
        allColumns,
        lowercaseEntity,
        capitalizeEntity,
        camelcase : require('camelcase')
    });

    FS.writeFileSync(`${process.cwd()}/test/${lowercase}.test.ts`,output);
    Log.success(`Created test/${lowercase}.test.ts`);

    await writeToRouter(lowercase);
    await project.save();
};

/**
 * Main function
 * Check entity existence, and write file or not according to the context
 *
 * @param {string} modelName
 * @param {object} crudOptions
 * @param {object|null} data
 * @returns {Promise<void>}
 */
const build = async (modelName, crudOptions, data = null) => {
    if (!modelName.length) {
        Log.error('Nothing to generate. Please, get entity name parameter.');
        return;
    }

    // assign false class properties
    lowercase = lowercaseEntity(modelName);
    capitalize = capitalizeEntity(modelName);

    await _write(data, crudOptions);

    Log.success('Generating task done');
};


module.exports = build;