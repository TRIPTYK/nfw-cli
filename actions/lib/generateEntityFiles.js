/**
 * @module generateEntityFiles
 * @description Generate entity files except model
 * @author Deflorenne Amaury
 * @author Verliefden Romain
 * @author Sam Antoine
 */

// node modules
const FS = require('fs');
const Util = require('util');
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

    controllerTemplateFile(`src/api/controllers/${lowercase}.controller.ts`,{
        className : `${capitalize}Controller`,
        options : crudOptions,
        entityName : lowercase
    });

    middlewareTemplateFile(`src/api/middlewares/${lowercase}.middleware.ts`,{
        className : `${capitalize}Middleware`,
        entityName : lowercase
    });

    relationsTemplateFile(`src/api/enums/relations/${lowercase}.relations.ts`,{
        foreignKeys
    });

    repositoryTemplateFile(`src/api/repositories/${lowercase}.repository.ts`,{
        className : `${capitalize}Repository`,
        entityName : lowercase
    });

    validationTemplateFile(`src/api/validations/${lowercase}.validation.ts`,{
        options : crudOptions,
        entityName : lowercase,
        entities : tableColumns
    });

    serializerTemplateFile(`src/api/serializers/${lowercase}.serializer.ts`,{
        className : `${capitalize}Serializer`,
        entityName : lowercase,
        columns : tableColumns
    });

    routeTemplateFile(`src/api/routes/v1/${lowercase}.route.ts`,{
        options : crudOptions,
        entityName : lowercase
    });

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