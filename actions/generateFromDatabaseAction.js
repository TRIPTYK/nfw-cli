/**
 * @author Verliefden Romain
 * @description get all table from DB then call writeModel method for each table in the database
 */

/**
 * Node modules
 */


/**
 * Project modules
 */
const inquirer = require('../utils/inquirer');
const databaseInfo = require('../database/databaseInfo');
const modelWrite = require('./writeModelAction');
const generateEntityFiles = require('./lib/generateEntityFiles');
const utils = require('./lib/utils');
const Log = require('../utils/log');
const sqlAdaptor = require('../database/sqlAdaptator');


// createRelation module
const createRelation = require('./createRelationAction');
const {noGenerate} = require('../static/resources');


/**
 * @returns {Promise<void>}
 */
module.exports = async () => {
    let p_tables = sqlAdaptor.getTables();
    let p_tablesIn = sqlAdaptor.getTablesInName();
    let Bridgings = [], foreignConstraint = [];
    let [tables, tablesIn] = await Promise.all([p_tables, p_tablesIn]);
    for (let j = 0; j < tables.length; j++) {
        let {columns, foreignKeys} = await databaseInfo.getTableInfo("sql", tables[j][tablesIn]);
        entityModelData = {columns, foreignKeys};
        if (utils.isBridgindTable(entityModelData)) {
            Bridgings.push(foreignKeys);
            continue;
        }
        for (let j = 0; j < columns.length; j++) columns[j].Type = utils.sqlTypeData(columns[j].Type);
        for (let j = 0; j < foreignKeys.length; j++) foreignConstraint.push(foreignKeys[j]);
        if (noGenerate.includes(tables[j][tablesIn])) continue; 
        await modelWrite.writeModel(tables[j][tablesIn], entityModelData)
            .catch(e => {
                Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                process.exit(1);
            });
        await generateEntityFiles(tables[j][tablesIn], 'crud', entityModelData);
    }
    await _BridgingTableHander(Bridgings);
    await _RelationHandler(foreignConstraint);
};

const _BridgingTableHander = async (Bridgings) => {
    for (let j = 0; j < Bridgings.length; j++) {
        await createRelation(Bridgings[j][0].REFERENCED_TABLE_NAME, Bridgings[j][1].REFERENCED_TABLE_NAME, 'mtm', Bridgings[j][0].TABLE_NAME, null)
            .then(() => Log.success("Relation successfully added !"))
            .catch((err) => Log.error(err.message));
    }
};

const _RelationHandler = async (foreignConstraint) => {
    for (let j = 0; j < foreignConstraint.length; j++) {
        if(noGenerate.includes(foreignConstraint[j].TABLE_NAME) && noGenerate.includes(foreignConstraint[j].REFERENCED_TABLE_NAME)) continue;
        let {response} = await inquirer.askForeignKeyRelation(foreignConstraint[j]);
        await createRelation(foreignConstraint[j].TABLE_NAME, foreignConstraint[j].REFERENCED_TABLE_NAME, response, foreignConstraint[j].COLUMN_NAME, foreignConstraint[j].REFERENCED_COLUMN_NAME)
            .then(() => Log.success("Relation successfully added !"))
            .catch((err) => Log.error(err.message));
    }
};