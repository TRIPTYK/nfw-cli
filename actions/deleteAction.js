/**
 * @module delete
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 * @description Delete entity files
 */

const {forEachStructureChild, StructureTypeGuards} = require('ts-morph');

// Node modules
const FS = require('fs');
const Util = require('util');
const snake = require('to-snake-case');

// Project modules
const { getSqlConnectionFromNFW  } = require('../database/sqlAdaptator');
const Log = require('../utils/log');
const {items} = require('../static/resources');
const {capitalizeEntity, lowercaseEntity} = require('./lib/utils');
const removeRel = require('./removeRelationAction');

const project = require('../utils/project');

// simulate class properties
let capitalize;
let lowercase;

/**
 *  @description deletes typescript files
 *  @returns {Promise<Array>}
 */
const _deleteTypescriptFiles = async () => {
    let deleted = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const file = project.getSourceFile(`${item.path}/${lowercase}.${item.template}.ts`);
        if (file) {
            deleted.push({fileName: `${item.path}/${lowercase}.${item.template}.ts`, type: 'delete'});
            file.delete();
        }
    }

    return deleted;
};

/**
 * @description Delete route related information in router index.ts
 * @returns {Promise<{fileName: string, type: string}[]>} deleted route
 */
const _unroute = async () => {
    const fileName = `src/api/routes/v1/index.ts`;
    const file = project.getSourceFile(fileName);

    file.getStatementsWithComments().forEach((e) => {
        if(e.getText().includes(`${capitalize}Router`))
            e.remove();
    });

    return [{type: 'edit', fileName: fileName}];
};

/**
 * @description removes Object and import from Typeorm config file
 * @returns {Promise<{fileName: string, type: string}[]>}
 */
const _unconfig = async () => {
    const relativePath = 'src/config/typeorm.config.ts';
    const file = project.getSourceFile(relativePath);

    const entitiesArray = file.getClass('TypeORMConfiguration').getStaticMethod('connect').getVariableDeclaration("entities").getInitializer();

    const index = entitiesArray.getElements().findIndex((value) => {
        return value.getText() === capitalize;
    });

    if (index !== -1) entitiesArray.removeElement(index);

    file.fixUnusedIdentifiers();

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

    let dumpPath = `./dist/migration/dump/${+new Date()}-${entityName}`;
    const sqlConnection = await getSqlConnectionFromNFW();

    let relations = await sqlConnection.getForeignKeysRelatedTo(entityName).catch((err) => {
        throw new Error(`Failed to get foreign keys related to ${entityName}` + err)
    });

    for (let i = 0; i < relations.length; i++)
        await removeRel(relations[i].TABLE_NAME, relations[i].REFERENCED_TABLE_NAME,relations[i].TABLE_NAME, relations[i].REFERENCED_TABLE_NAME);


    let promises = [  // launch all tasks in async
        _deleteTypescriptFiles(),
        _unroute(),
        _unconfig(),
    ];

    let results = await Promise.all(promises);
    let modifiedFiles = [];

    results.forEach((e) => {
        modifiedFiles = modifiedFiles.concat(e)
    });

    if (await sqlConnection.tableExists(entityName) && drop) {
        await sqlConnection.dumpTable(dumpPath, entityName)
            .then(() => Log.success(`SQL dump created at : ${dumpPath}`))
            .catch(() => {
                throw new Error(`Failed to create dump`);
           });

        await sqlConnection.dropTable(entityName)
            .then(() => Log.success("Table dropped"))
            .catch(() => Log.error("Failed to delete table"));
    }

    await project.save();

    return modifiedFiles;
};
