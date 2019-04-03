const SqlAdaptator = require ('./database/sqlAdaptator');
const databaseInfo = require ('./databaseInfo');
const modelWrite = require ('./modelWrite');
const index = require ('./index');
const utils = require('./utils');
const Log = require('./log');
const inquirer = require ('../lib/inquirer');
const command = require('../utils/createRelation');
// basic project tables to ignore
const noGenerate = ['user','document','refresh_token','migration_table'];


const _BridgingTableHander = async (Bridgings) => {
    for (let j = 0; j < Bridgings.length; j++) {
        await command.createRelation(Bridgings[j][0].REFERENCED_TABLE_NAME, Bridgings[j][1].REFERENCED_TABLE_NAME, 'mtm',Bridgings[j][0].TABLE_NAME,null)
            .then(() => Log.success("Relation successfully added !"))
            .catch((err) => Log.error(err.message));
    }
}

const _RelationHandler = async (foreignConstraint) => {
    for (let j = 0; j < foreignConstraint.length; j++) {
        let { response } = await inquirer.askForeignKeyRelation(foreignConstraint[j]);
        console.log(response);
        let relation = '', i = 0;
        while (i < response.length) {
            if (response[i] == response[i].toUpperCase()) relation += response[i].toLowerCase();
            i++
        }
        await command.createRelation(foreignConstraint[j].TABLE_NAME, foreignConstraint[j].REFERENCED_TABLE_NAME, relation,foreignConstraint[j].COLUMN_NAME,foreignConstraint[j].REFERENCED_COLUMN_NAME)
            .then(() => Log.success("Relation successfully added !"))
            .catch((err) => Log.error(err.message));
    }
}


/**
 * @author Verliefden Romain
 * @description get all table from DB then call writeModel method for each table in the database
 * @constructor
 * @module generateFromDB
 */
module.exports = async () =>{
    let p_tables = SqlAdaptator.getTables();
    let p_tablesIn = SqlAdaptator.getTablesInName();
    let Bridgings=[],foreignConstraint=[];
    let [tables,tablesIn] = await Promise.all([p_tables,p_tablesIn]);
    for(let j = 0;j<tables.length;j++){
        if (noGenerate.includes(tables[j][tablesIn])) continue;
        let { columns, foreignKeys } = await databaseInfo.getTableInfo("sql", tables[j][tablesIn]);
        entityModelData = { columns, foreignKeys };
        if(utils.isBridgindTable(entityModelData)) {
            Bridgings.push(foreignKeys);
            continue;
        }
        for (let j = 0; j < columns.length; j++)  columns[j].Type = utils.sqlTypeData(columns[j].Type);
        for (let j = 0; j < foreignKeys.length; j++)  foreignConstraint.push(foreignKeys[j]);
        await modelWrite.main('write', tables[j][tablesIn], entityModelData)
            .catch(e => {
                Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                process.exit(1);
            });
        await index(tables[j][tablesIn], 'crud');
    };
    await _BridgingTableHander(Bridgings);
    await _RelationHandler(foreignConstraint);
};
