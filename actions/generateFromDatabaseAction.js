/**
 * @author Verliefden Romain
 * @module generateFromDatabaseAction
 * @description Get all table from DB then call writeModel method for each table in the database
 */

// Project modules
const inquirer = require('../utils/inquirer');
const modelWrite = require('./writeModelAction');
const generateEntityFiles = require('./lib/generateEntityFiles');
const utils = require('./lib/utils');
const Log = require('../utils/log');
const { getSqlConnectionFromNFW } = require('../database/sqlAdaptator');
const createRelation = require('./createRelationAction');
const {noGenerate} = require('../static/resources');

/**
 * Main function
 * @returns {Promise<void>}
 */
module.exports = async () => {
    const sqlAdaptor = await getSqlConnectionFromNFW();
    const databaseName = sqlAdaptor.environement.TYPEORM_DB;
    let p_tables = sqlAdaptor.getTables();
    let p_tablesIn = "Tables_in_" + databaseName;
    let Bridgings = [], foreignConstraint = [];
    let [tables, tablesIn] = await Promise.all([p_tables, p_tablesIn]);

    let crudOptions = {
        create: true,
        read: true,
        update: true,
        delete: true
    };

    for (let j = 0; j < tables.length; j++) {
        let {columns, foreignKeys} = await sqlAdaptor.getTableInfo(tables[j][tablesIn]);
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
        await generateEntityFiles(tables[j][tablesIn], crudOptions, entityModelData);
    }
    await _BridgingTableHander(Bridgings);
    await _RelationHandler(foreignConstraint);
};

/**
 *
 * @param Bridgings
 * @returns {Promise<void>}
 */
const _BridgingTableHander = async (Bridgings) => {
    for (let j = 0; j < Bridgings.length; j++) {
        Log.info(`a reliationship has been detected between ${Bridgings[j][0].REFERENCED_TABLE_NAME} and ${Bridgings[j][1].REFERENCED_TABLE_NAME}`)
        let {m1Name,m2Name} = await inquirer.questionM1M2(Bridgings[j][0].REFERENCED_TABLE_NAME, Bridgings[j][1].REFERENCED_TABLE_NAME);
        await createRelation(Bridgings[j][0].REFERENCED_TABLE_NAME, Bridgings[j][1].REFERENCED_TABLE_NAME, 'mtm', Bridgings[j][0].TABLE_NAME, null,m1Name,m2Name)
            .then(() => Log.success("Relation successfully added !"))
            .catch((err) => Log.error(err.message));
    }
};

/**
 *
 * @param foreignConstraint
 * @returns {Promise<void>}
 */
const _RelationHandler = async (foreignConstraint) => {
    for (let j = 0; j < foreignConstraint.length; j++) {
        if(noGenerate.includes(foreignConstraint[j].TABLE_NAME) && noGenerate.includes(foreignConstraint[j].REFERENCED_TABLE_NAME)) continue;
        let {response} = await inquirer.askForeignKeyRelation(foreignConstraint[j]);
        let {m1Name,m2Name} = await inquirer.questionM1M2(foreignConstraint[j].TABLE_NAME, foreignConstraint[j].REFERENCED_TABLE_NAME);
        await createRelation(foreignConstraint[j].TABLE_NAME, foreignConstraint[j].REFERENCED_TABLE_NAME, response, m2Name, foreignConstraint[j].REFERENCED_COLUMN_NAME,m1Name,m2Name)
            .then(() => Log.success("Relation successfully added !"))
            .catch((err) => Log.error(err.message));
    }
};