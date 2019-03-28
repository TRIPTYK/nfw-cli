const SqlAdaptator = require ('./database/sqlAdaptator');
const databaseInfo = require ('./databaseInfo');
const modelWrite = require ('./modelWrite');
const index = require ('./index');
const utils = require('./utils');
const Log = require('./log');
// basic project tables to ignore
const noGenerate = ['user','document','refresh_token','migration_table'];

/**
 * @author Verliefden Romain
 * @description get all table from DB then call writeModel method for each table in the database
 */
module.exports = async () =>{
    let p_tables = SqlAdaptator.getTables();
    let p_tablesIn = SqlAdaptator.getTablesInName();

    let [tables,tablesIn] = await Promise.all([p_tables,p_tablesIn]);

    for(let j = 0;j<tables.length;j++){
        if (noGenerate.includes(tables[j][tablesIn])) return;
        let { columns, foreignKeys } = await databaseInfo.getTableInfo("sql", tables[j][tablesIn]);
        console.log(columns);
        for (let j = 0; j < columns.length; j++) {
            columns[j].Type = utils.sqlTypeData(columns[j].Type);
        }
        if (foreignKeys && foreignKeys.length) {
            for (let i = 0; i < foreignKeys.length; i++) {
                let tmpKey = foreignKeys[i];
                let response = (await inquirer.askForeignKeyRelation(tmpKey)).response;
                foreignKeys[i].type = response;
            }
        }
        entityModelData = { columns, foreignKeys };
        await modelWrite('write', tables[j][tablesIn], entityModelData)
            .catch(e => {
                Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                process.exit(1);
            });
        await index(tables[j][tablesIn], 'crud');

   };
   process.exit(0);
};
