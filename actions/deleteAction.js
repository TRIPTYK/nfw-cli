/**
 * @module delete
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 * @description Delete entity files
 */

// Node modules
const FS = require('fs');
const Util = require('util');
const snake = require('to-snake-case');

// Project modules
const SqlAdaptator = require('../database/sqlAdaptator');
const Log = require('../utils/log');
const {items} = require('../static/resources');
const {capitalizeEntity, removeImport, isImportPresent, lowercaseEntity, fileExists} = require('./lib/utils');

// Promisify
const ReadFile = Util.promisify(FS.readFile);
const Unlink = Util.promisify(FS.unlink);
const WriteFile = Util.promisify(FS.writeFile);

// simulate class properties
let capitalize;
let lowercase;

const processPath = process.cwd();

/**
 * @description deletes compiled typescript files , ignoring tests
 * @returns {Promise<void>}
 */
const _deleteCompiledJS = async () => {
    await Promise.all(items.map(async (item) => {
        if (item.template === 'test') return; // no compiled tests

        let relativeFilePath = `/dist/api/${item.dest}/${lowercase}.${item.template}.js`;
        let filePath = processPath + relativeFilePath;

        if (fileExists(filePath)) {
            await Unlink(filePath)
                .then(() => Log.success(`Compiled ${item.template[0].toUpperCase()}${item.template.substr(1)} deleted.`))
                .catch(() => Log.error(`Error while deleting compiled ${item.template}`));
        } else {
            Log.warning(`Cannot delete compiled ${relativeFilePath} : file does not exists`);
        }
    }));
};

/**
 *  @description deletes typescript files
 *  @returns {Promise<void>}
 */
const _deleteTypescriptFiles = async () => {
    await Promise.all(items.map(async (item) => {
        let relativeFilePath = `/src/api/${item.dest}/${lowercase}.${item.template}.${item.ext}`;
        let filePath = processPath + relativeFilePath;

        if (fileExists(filePath)) {
            await Unlink(filePath)
                .then(() => Log.success(`${item.template[0].toUpperCase()}${item.template.substr(1)} deleted.`))
                .catch(() => Log.error(`Error while deleting ${item.template} \n`));
        } else {
            Log.warning(`Cannot delete ${relativeFilePath} : file does not exists`);
        }
    }));
};

/**
 * @description Delete route related informations in router index.ts
 * @returns {Promise<void>}
 */
const _unroute = async () => {
    let proxyPath = `${processPath}/src/api/routes/v1/index.ts`;
    let proxy = await ReadFile(proxyPath, 'utf-8');

    // this regex will match a use statement and the associated JSDoc comment
    let toRoute = new RegExp(`\n?((\\\/\\*[\\w'\\s\\r\\n*]*\\*\\\/)|(\\\/\\\/[\\w\\s']*))\\s*(\\w*.use.*${capitalize}Router(.|\\s){1};)\n?`, "gm");

    // replace match by nothing
    proxy = removeImport(proxy, `${capitalize}Router`)
        .replace(toRoute, "");

    await WriteFile(proxyPath, proxy)
        .catch(() => Log.error(`Failed to write to ${proxyPath}`));
};

/**
 * @description removes Object and import from Typeorm config file
 * @returns {Promise<void>}
 */
const _unconfig = async () => {
    let configFileName = `${process.cwd()}/src/config/typeorm.config.ts`;
    let fileContent = await ReadFile(configFileName, 'utf-8');

    if (isImportPresent(fileContent, capitalize)) {
        let imprt = removeImport(fileContent, capitalize)
            .replace(new RegExp(`(?=,?${capitalize}\\b),${capitalize}\\b|${capitalize}\\b,?`, "gm"), "");

        await WriteFile(configFileName, imprt).catch(() => {
            Log.error(`Failed to write to : ${configFileName}`);
        });
    }
};

/**
 * @description Module export main entry , it deletes generated files
 * @param {string} entityName
 * @param {boolean} drop if true , drop the table in database
 * @returns {Promise<void>}
 */
module.exports = async (entityName, drop) => {
    entityName = snake(entityName);
    //constructor behavior
    capitalize = capitalizeEntity(entityName);
    lowercase = lowercaseEntity(entityName);

   

    let promises = [  // launch all tasks in async
        _deleteTypescriptFiles(),
        _deleteCompiledJS(),
        _unroute(),
        _unconfig(),
    ];

    await Promise.all(promises);

    let dumpPath = `./dist/migration/dump/${+new Date()}-${entityName}`;

    if (await SqlAdaptator.tableExists(entityName) && drop) {
        await SqlAdaptator.dumpTable(entityName, dumpPath)
            .then(() => Log.success(`SQL dump created at : ${dumpPath}`))
            .catch(() => {
                throw new Error('Failed to create dump');
            });
        await SqlAdaptator.DeleteForeignKeys(entityName)
            .then(() => Log.success("Table dropped"))
            .catch(() => {
                throw new Error('Failed to drop foreign keys');
            });
        await SqlAdaptator.dropTable(entityName)
            .then(() => Log.success("Table dropped"))
            .catch(() => Log.error("Failed to delete table"));
    }
};
