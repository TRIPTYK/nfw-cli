/**
 * @author Antoine Samuel
 * @author Deflorenne Amaury
 * @description Generate and executes a migration
 * @module migrateAction
 */

const  {getSqlConnectionFromNFW} = require("../database/sqlAdaptator");
const project = require("../utils/project");
const Log = require('../utils/log');

// Node modules
const util = require('util');
const fs = require('fs');
const editJsonFile = require("edit-json-file");
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const chalk = require('chalk');

/**
 * Main function
 * @param modelName
 * @returns {Promise<array>}
 */
module.exports = async (modelName,isRevert) => {
    const ormConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/ormconfig.json`, 'utf-8'));
    const connection = await getSqlConnectionFromNFW();
    const file = editJsonFile('./src/migration/migration.cfg',{});
    const getMigrationFileNameFromRecord = (record) => record.timestamp + '-' + record.name.replace(record.timestamp.toString(),'');

    if (isRevert) {
        const formatMigrationArray = (array) => array.map(table => Object.values(table)[0]);

        let [[revertTo] , [current]] = await Promise.all([
            connection.select( 'migration_table',['timestamp', 'name'],`WHERE name LIKE '${modelName}%' ORDER BY timestamp DESC`),
            file.get('current') === 'last' ? connection.select( 'migration_table',['timestamp', 'name'],`ORDER BY timestamp DESC`) : connection.select( 'migration_table',['timestamp', 'name'],`WHERE name = '${file.get('current')}' ORDER BY timestamp DESC`)
        ]);

        const between = await connection.select('migration_table',['timestamp','name'],`WHERE timestamp BETWEEN ${revertTo.timestamp} AND ${current.timestamp} ORDER BY timestamp DESC`);

        if (revertTo.length === 0) throw new Error('Revert migration not found');
        if (revertTo.timestamp >= current.timestamp) throw new Error('You are trying to revert to the same or a newer migration , please do a simple nfw migrate');

        file.set("current",revertTo.name);

        const dump = fs.readFileSync(`${ormConfig.cli.migrationsDir}/${getMigrationFileNameFromRecord(revertTo)}.sql`, 'utf-8');
        let errors = 0 , success = 0;

        await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

        for (let forMigration of between) {
            let forMigrationFileName = getMigrationFileNameFromRecord(forMigration);
            const migrationFile = project.getSourceFile(`${ormConfig.cli.migrationsDir}/${forMigrationFileName}.ts`);

            const functionText = migrationFile.getClasses()[0].getMethod('down').getText(); // get the class and method text
            const regexDownStatement = /\("(.*?)"\)/gm; // extract sql statements
            let res;

            while ((res = regexDownStatement.exec(functionText)) !== null) {
                await connection.query(res[1])
                .then(() => {
                    success++;
                })
                .catch((e) => {
                    errors++;
                });
            }
        }

        Log.info(`\nMigration code executed with ${chalk.red(errors.toString())} query failed and ${chalk.green(success.toString())} success in ${chalk.blue(between.length.toString())} migration files`);

        const allTables = formatMigrationArray(await connection.getTables()).filter((file) =>  file !== 'migration_table');
        await Promise.all(allTables.map((table) => connection.query(`TRUNCATE TABLE ${table};`)));
        await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
        await connection.query(dump);
    }else{
        const typeorm_cli = path.resolve('.', 'node_modules', 'typeorm', 'cli.js');
        const ts_node = path.resolve('.', 'node_modules', '.bin', 'ts-node');

        Log.info("Please note that you will probably need to update the migration file");

        await exec(`${ts_node} ${typeorm_cli} migration:generate -n ${modelName}`);
        await exec(`${ts_node} ${typeorm_cli} migration:run`);

        file.set("current",'last');

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

    await file.save();

    return [ ormConfig.cli.migrationsDir ]; // return migration output path
};