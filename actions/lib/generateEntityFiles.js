/**
 * @module index
 * @exports build
 */
/**
 * Requirement of the library FS
 * @description Handle read/write stream I/O
 */
const FS = require('fs');
const ejs = require('ejs');
const pluralize = require('pluralize');
const { plural } = require('pluralize');
/**
 * Requirement of the library Utils
 * @description Needed to promisify async methods
 */
const Util = require('util');
/**
 * Get the informations about the templates generation
 * @returns {Array.<JSON>} Return an array of json object
 */
const {items} = require('../../static/resources');
/**
 * Requirement of the logs library
 *@description Define function to simplify console logging
 */
const Log = require('../../utils/log');
/**
 * Requirement of the functions "countLine" and "capitalizeEntity" from the local file utils
 */
const {capitalizeEntity, lowercaseEntity, buildJoiFromColumn, writeToFirstEmptyLine, isImportPresent} = require('./utils');
/**
 * Transform a async method to a promise
 * @returns {Promise} returns FS.exists async function as a promise
 */
const ReadFile = Util.promisify(FS.readFile);
const WriteFile = Util.promisify(FS.writeFile);

const kebabCase = require('kebab-case');

const processPath = process.cwd();

// false class properties
var capitalize;
var lowercase;


const _routerWrite = async () => {
    let proxyPath = `${processPath}/src/api/routes/v1/index.ts`;
    let routeUsePath = `${__baseDir}/templates/route/routerUse.ejs`;

    let p_proxy = ReadFile(proxyPath, 'utf-8');
    let p_route = ReadFile(routeUsePath, 'utf-8');
    let [proxy, route] = await Promise.all([p_proxy, p_route]); //wait for countlines and read to finish

    route = ejs.compile(route)({
        entityLowercase: lowercase,
        entityCapitalize: capitalize,
        plural
    });

    if (!isImportPresent(proxy, `${capitalize}Router`)) {
        let output = writeToFirstEmptyLine(proxy, `import { router as ${capitalize}Router } from "./${lowercase}.route";\n`)
            .replace(/^\s*(?=.*export.*)/m, `\n\n${route}\n\n`); // inserts route BEFORE the export statement , eliminaing some false-positive

        try {
            await WriteFile(proxyPath, output)
                .then(() => {
                    Log.success(`Proxy router file updated.`);
                    Log.success(`Files generating done.`);
                });
        } catch (e) { // try-catch block needed , otherwise we will need to launch an async function in catch()
            console.log(e.message);
            console.log('Original router file will be restored ...');
            await WriteFile(proxyPath, proxy)
                .catch(e => Log.error(e.message));
            Log.success(`Original router file restoring done.`);
            Log.success(`Files generating done.`);
            Log.warning(`Check the api/routes/v1/index.ts to update`);
        }
    } else {
        Log.info(`Proxy router already contains routes for this entity : routes/v1/index.ts generating ignored.`);
        Log.success(`Files generating done.`);
    }
};

/**
 * @description replace the vars in placeholder in file and creates them
 * @param data
 * @param crudOptions
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

        await WriteFile(`${processPath}/src/api/${item.dest}/${lowercase}.${item.template}.${item.ext}`, output)
            .then(() => {
                Log.success(`${capitalizeEntity(item.template)} generated.`)
            })
            .catch(() => {
                Log.error(`Error while ${item.template} file generating \n`);
                Log.warning(`Check the api/${item.dest}/${lowercase}.${item.template}.${item.ext} to update`);
            });
    });

    promises.push(_routerWrite()); // add the router write promise to the queue
    await Promise.all(promises); // wait for all async to finish
};

/**
 * Main function
 * Check entity existence, and write file or not according to the context
 *
 * @param modelName
 * @param crudOptions
 * @param data
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