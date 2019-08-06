/**
 * @author Antoine Samuel
 * @author Deflorenne Amaury
 * @description Generate and executes a migration
 * @module migrateAction
 */

const  {getSqlConnectionFromNFW} = require("../database/sqlAdaptator");

// Node modules
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

/**
 * Main function
 * @param modelName
 * @param restore
 * @returns {Promise<array>}
 */
module.exports = async (modelName,restore) => {
    const ormConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/ormconfig.json`, 'utf-8'));
    const connection = await getSqlConnectionFromNFW();
    const getMigrationFileNameFromRecord = (record) => record.timestamp + '-' + record.name.replace(record.timestamp.toString(),'');

    if (restore) {
        const formatMigrationArray = (array) => array.map(table => Object.values(table)[0]);

        let [revertTo] = await connection.select( 'migration_table',['timestamp', 'name'],`WHERE name LIKE '${modelName}%' ORDER BY timestamp DESC`);
        const dump = fs.readFileSync(`${ormConfig.cli.migrationsDir}/${getMigrationFileNameFromRecord(revertTo)}.sql`, 'utf-8');

        await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
        const allTables = formatMigrationArray(await connection.getTables()).filter((file) =>  file !== 'migration_table');
        await Promise.all(allTables.map((table) => connection.query(`TRUNCATE TABLE ${table};`)));
        await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
        await connection.query(dump);
    }else{
        const typeorm_cli = path.resolve('.', 'node_modules', 'typeorm', 'cli.js');
        const ts_node = path.resolve('.', 'node_modules', '.bin', 'ts-node');

        await exec(`${ts_node} ${typeorm_cli} migration:generate -n ${modelName}`);
        await exec(`${ts_node} ${typeorm_cli} migration:run`);

        let [latest] = await connection.select( 'migration_table',['timestamp', 'name'],'ORDER BY timestamp DESC');
        const dumpName = `${ormConfig.cli.migrationsDir}/${getMigrationFileNameFromRecord(latest)}`;

        await connection.dumpAll(dumpName, {
            dumpOptions: {
                schema: false,
                tables: ['migration_table'],
                excludeTables: true,
                data: {
                    format: false
                }
            }
        });
    }

    return [ ormConfig.cli.migrationsDir ]; // return migration output path
};