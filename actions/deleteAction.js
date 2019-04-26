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
const { getSqlConnectionFromNFW  } = require('../database/sqlAdaptator');
const Log = require('../utils/log');
const {items} = require('../static/resources');
const {capitalizeEntity, removeImport, isImportPresent, lowercaseEntity, fileExists} = require('./lib/utils');
const removeRel = require('./removeRelationAction');

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
 * @returns {Promise<array>} deleted files
 */
const _deleteCompiledJS = async () => {
    let deletedJs = [];

    await Promise.all(items.map(async (item) => {
        if (item.template === 'test') return; // no compiled tests

        let relativeFilePath = `/dist/api/${item.dest}/${lowercase}.${item.template}.js`;
        let filePath = processPath + relativeFilePath;

        if (fileExists(filePath)) {
            await Unlink(filePath)
                .catch(() => Log.error(`Error while deleting compiled ${item.template}`));
            deletedJs.push({fileName: relativeFilePath, type: 'delete'});
        } else {
            Log.warning(`Cannot delete compiled ${relativeFilePath} : file does not exists`);
        }
    }));

    return deletedJs;
};

/**
 *  @description deletes typescript files
 *  @returns {Promise<Array>}
 */
const _deleteTypescriptFiles = async () => {
    let deleted = [];

    await Promise.all(items.map(async (item) => {
        let relativeFilePath = `/src/api/${item.dest}/${lowercase}.${item.template}.${item.ext}`;
        let filePath = processPath + relativeFilePath;

        if (fileExists(filePath)) {
            await Unlink(filePath);
            deleted.push({fileName: relativeFilePath, type: 'delete'});
        } else {
            Log.warning(`Cannot delete ${relativeFilePath} : file does not exists`);
        }
    }));

    return deleted;
};

/**
 * @description Delete route related information in router index.ts
 * @returns {Promise<{fileName: string, type: string}[]>} deleted route
 */
const _unroute = async () => {
    const relativePath = '/src/api/routes/v1/index.ts';
    const proxyPath = `${processPath}${relativePath}`;
    let proxy = await ReadFile(proxyPath, 'utf-8');

    // this regex will match a use statement and the associated JSDoc comment
    let toRoute = new RegExp(`\n?((\\\/\\*[\\w'\\s\\r\\n*]*\\*\\\/)|(\\\/\\\/[\\w\\s']*))\\s*(\\w*.use.*${capitalize}Router(.|\\s){1};)\n?`, "gm");

    // replace match by nothing
    proxy = removeImport(proxy, `${capitalize}Router`)
        .replace(toRoute, "");

    await WriteFile(proxyPath, proxy)
        .catch(() => Log.error(`Failed to write to ${proxyPath}`));

    return [{type: 'edit', fileName: relativePath}];
};

/**
 * @description removes Object and import from Typeorm config file
 * @returns {Promise<{fileName: string, type: string}[]>}
 */
const _unconfig = async () => {
    const relativePath = '/src/config/typeorm.config.ts';
    let configFileName = `${process.cwd()}${relativePath}`;
    let fileContent = await ReadFile(configFileName, 'utf-8');

    if (isImportPresent(fileContent, capitalize)) {
        let imprt = removeImport(fileContent, capitalize)
            .replace(new RegExp(`(?=,?${capitalize}\\b),${capitalize}\\b|${capitalize}\\b,?`, "gm"), "");

        await WriteFile(configFileName, imprt).catch(() => {
            Log.error(`Failed to write to : ${configFileName}`);
        });
    }

    return [{type: 'edit', fileName: relativePath}];
};

/**
 * @description Module export main entry , it deletes generated files
 * @param {string} entityName
 * @param {boolean} drop if true , drop the table in database
 * @returns {Promise<Array>}
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

    let results = await Promise.all(promises);
    let modifiedFiles = [];

    results.forEach((e) => {
        modifiedFiles = modifiedFiles.concat(e)
    });

    let dumpPath = `./dist/migration/dump/${+new Date()}-${entityName}`;
    const sqlConnection = await getSqlConnectionFromNFW();

    if (await sqlConnection.tableExists(entityName) && drop) {
        await sqlConnection.dumpTable(entityName, dumpPath)
            .then(() => Log.success(`SQL dump created at : ${dumpPath}`))
            .catch(() => {
                throw new Error(`Failed to create dump`);
           });
        let relations = await sqlConnection.getForeignKeysRelatedTo(entityName).catch((err) => {
            throw new Error(`Failed to get foreign keys related to ${entityName}`+ err)
        });
        for(let i = 0; i<relations.length; i++) await removeRel(relations[i].TABLE_NAME,relations[i].REFERENCED_TABLE_NAME)     
        await sqlConnection.dropTable(entityName)
            .then(() => Log.success("Table dropped"))
            .catch(() => Log.error("Failed to delete table"));
    }

    return modifiedFiles;
};
