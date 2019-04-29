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
const pluralize = require('pluralize');
const Util = require('util');
const kebabCase = require('kebab-case');
const chalk = require('chalk');

// project modules
const {items} = require('../../static/resources');
const Log = require('../../utils/log');
const writeToRouter = require('./routerWrite');
const {capitalizeEntity, lowercaseEntity, buildJoiFromColumn} = require('./utils');

// promisify
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);

const processPath = process.cwd();

// false class properties
let capitalize;
let lowercase;

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
    let promises = items.map(async (item) => {
        // handle model template separately
        if (item.template === 'model') return;

        let file = await ReadFile(`${__baseDir}/templates/${item.template}.ejs`, 'utf-8');

        let output = ejs.compile(file)({
            entityLowercase: lowercase,
            entityCapitalize: capitalize,
            options: crudOptions,
            tableColumns,
            allColumns,
            lowercaseEntity,
            capitalizeEntity,
            foreignKeys,
            pluralize,
            kebabCase,
            validation: tableColumns.map(c => buildJoiFromColumn(c)).filter(c => !c.name.match(/create_at|update_at/))
        });

        await WriteFile(`${processPath}/${item.path}/${lowercase}.${item.template}.ts`, output)
            .then(() => {
                Log.success(`${capitalizeEntity(item.template)} generated in ${chalk.cyan(`${item.path}/${lowercase}.${item.template}.ts`)}`);
            })
            .catch(() => {
                Log.error(`Error while ${item.template} file generating \n`);
                Log.warning(`Check the api/${item.path}/${lowercase}.${item.template}.${item.ext} to update`);
            });
    });

    promises.push(writeToRouter(lowercase)); // add the router write promise to the queue
    await Promise.all(promises); // wait for all async to finish
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