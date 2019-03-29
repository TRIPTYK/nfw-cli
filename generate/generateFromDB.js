const SqlAdaptator = require ('./database/sqlAdaptator');
const databaseInfo = require ('./databaseInfo');
const modelWrite = require ('./modelWrite');
const index = require ('./index');
const utils = require('./utils');
const Log = require('./log');
const inquirer = require ('../lib/inquirer');
const command = require('../utils/execShellCommands');
// basic project tables to ignore
const noGenerate = ['user','document','refresh_token','migration_table'];


const _BridgingTableHander= async (Bridgings)=>{   
    for (let j = 0; j < Bridgings.length; j++) {
        let { confirmation } = await inquirer.askForConfirmation(`${Bridgings[j]} has been detected as a briding table. Do you want to add the manytomany relationship in the model now ?`)
        console.log(confirmation);
        if (confirmation) {
            let { models } = await inquirer.askMtmModels();
            // await command.createRelation(models[0],models[1],'mtm');
        }
    }
}

const _RelationHandler = async (foreignConstraint) =>{
    console.log(foreignConstraint);
}

// let relationTemp = {
//     TABLE_NAME: entity,
//     COLUMN_NAME : columnName,
//     REFERENCED_TABLE_NAME: referencedTable.trim(),
//     REFERENCED_COLUMN_NAME: referencedColumn,
// };

/**
 * @author Verliefden Romain
 * @description get all table from DB then call writeModel method for each table in the database
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
            Bridgings.push(tables[j][tablesIn]);
            continue;
        }
        for (let j = 0; j < columns.length; j++)  columns[j].Type = utils.sqlTypeData(columns[j].Type);
        for (let j = 0; j < foreignKeys.length; j++)  foreignConstraint.push(foreignKeys[j]);
        
        // await modelWrite('write', tables[j][tablesIn], entityModelData)
        //     .catch(e => {
        //         Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
        //         process.exit(1);
        //     });
        // await index(tables[j][tablesIn], 'crud');
    };
    //await _BridgingTableHander(Bridgings);
    await _RelationHandler(foreignConstraint);
    process.exit(0);
};
