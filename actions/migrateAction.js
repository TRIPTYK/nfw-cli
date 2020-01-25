/**
 * @author Antoine Samuel
 * @author Deflorenne Amaury
 * @description Generate and executes a migration
 * @module migrateAction
 */

const  {getSqlConnectionFromNFW} = require("../database/sqlAdaptator");

// Node modules
const JsonFileWriter = require("json-file-rw");
const util = require('util');
const fs = require('fs');
const chalk = require('chalk');
const mkdirp = util.promisify(require('mkdirp'));
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const project = require('../utils/project');
const Log = require('../utils/log');

const _buildErrorObjectFromMessage = (e) => {
    const msgReg = /^\s*(\w+):\s*([ -+|\--z]*),?/gm;
    let m;
    let errObj = {};

    while ((m = msgReg.exec(e.message)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === msgReg.lastIndex) {
            msgReg.lastIndex++;
        }
        
        let [,property,content] = m;

        errObj[property] = content
            .replace(/^'|'$/g,"")
            .replace(/\\'/g,"'");
    }   
    return errObj;
}

/**
 * Main function
 * @param modelName
 * @param restore
 * @param dump 
 * @returns {Promise<array>}
 */
module.exports = async (modelName,restore,dump,isRevert) => {
    const ormConfig = new JsonFileWriter();
    ormConfig.openSync("./ormconfig.json");
    const connection = await getSqlConnectionFromNFW();
    const getMigrationFileNameFromRecord = (record) => record.timestamp + '-' + record.name.replace(record.timestamp.toString(),'');

    const nfwConfig = new JsonFileWriter();
    nfwConfig.openSync(".nfw");
    const currentEnv = nfwConfig.getNodeValue("env","development");

    await mkdirp(`src/migration/${currentEnv}/failed`);

    const migrationDir = ormConfig.getNodeValue("cli.migrationsDir");

    const migrationConfig = new JsonFileWriter();
    migrationConfig.openSync('./src/migration/migration.cfg');
    if (!migrationConfig.fileExists) {
        migrationConfig.setNodeValue('current','last');
    }

    ormConfig.saveSync();

    if (restore) {
        const formatMigrationArray = (array) => array.map(table => Object.values(table)[0]);

        let [revertTo] = await connection.select( 'migration_table',['timestamp', 'name'],`WHERE name LIKE '${modelName}%' ORDER BY timestamp DESC`);
        const dump = fs.readFileSync(`${migrationDir}/${getMigrationFileNameFromRecord(revertTo)}.sql`, 'utf-8');

        await connection.query("SET FOREIGN_KEY_CHECKS = 0;");
        const allTables = formatMigrationArray(await connection.getTables()).filter((file) =>  file !== 'migration_table');
        await Promise.all(allTables.map((table) => connection.query(`TRUNCATE TABLE ${table};`)));
        await connection.query("SET FOREIGN_KEY_CHECKS = 1;");
        await connection.query(dump);
    }
    else if(isRevert) {
        const formatMigrationArray = (array) => array.map(table => Object.values(table)[0]);

        let [[revertTo] , [current]] = await Promise.all([
            connection.select( 'migration_table',['timestamp', 'name'],`WHERE name LIKE '${modelName}%' ORDER BY timestamp DESC`),
            migrationConfig.getNodeValue('current') === 'last' ? connection.select( 'migration_table',['timestamp', 'name'],`ORDER BY timestamp DESC`) : connection.select( 'migration_table',['timestamp', 'name'],`WHERE name = '${migrationConfig.getNodeValue('current')}' ORDER BY timestamp DESC`)
        ]);

        const between = await connection.select('migration_table',['timestamp','name'],`WHERE timestamp BETWEEN ${revertTo.timestamp} AND ${current.timestamp} ORDER BY timestamp DESC`);

        if (revertTo.length === 0) throw new Error('Revert migration not found');
        if (revertTo.timestamp >= current.timestamp) throw new Error('You are trying to revert to the same or a newer migration , please do a simple nfw migrate');

        migrationConfig.setNodeValue("current",revertTo.name);
        //let dump = fs.readFileSync(`${migrationDir}/${getMigrationFileNameFromRecord(revertTo)}.sql`, 'utf-8');
        let errors = 0 , success = 0;

        await connection.query("SET FOREIGN_KEY_CHECKS = 0;");

        for (let forMigration of between) {
            let forMigrationFileName = getMigrationFileNameFromRecord(forMigration);
            const migrationFile = project.getSourceFile(`${migrationDir}/${forMigrationFileName}.ts`);

            const functionText = migrationFile.getClasses()[0].getMethod('down').getText(); // get the class and method text
            console.log(functionText)
            const regexDownStatement = /\"(.*?)\"/gm; // extract sql statements
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
        //await connection.query(dump);

        migrationConfig.saveSync();

    }else{
        const typeorm_cli = path.resolve('.', 'node_modules', 'typeorm', 'cli.js');
        const ts_node = path.resolve('.', 'node_modules', '.bin', 'ts-node');   

        await exec(`${ts_node} ${typeorm_cli} migration:generate -n ${modelName}`);
        
        const files = fs.readdirSync(migrationDir,{withFileTypes : true}).filter(dirent => !dirent.isDirectory())
        .map(dirent => dirent.name);

        const recentTimestamp = Math.max.apply(null,files.map((e) => {
            return parseInt(e.split("-")[0],10);
        }));
        
        const migrationFile = `${recentTimestamp}-${modelName}.ts`;

        try {
            await exec(`${ts_node} ${typeorm_cli} migration:run`);
        }catch(e) {
            const obj = _buildErrorObjectFromMessage(e);
            const backupDir = `src/migration/${currentEnv}/failed`;

            Log.warning(`Got some errors in migration , removing and backing up file ${migrationFile} in ${backupDir}`);
            Log.warning(obj.message);

            fs.renameSync(`src/migration/${currentEnv}/${migrationFile}`,`${backupDir}/${migrationFile}`);
        }
        migrationConfig.setNodeValue('current','last');
        migrationConfig.saveSync();
    }
    
    if(dump){
        let [latest] = await connection.select( 'migration_table',['timestamp', 'name'],'ORDER BY timestamp DESC');
        const dumpName = `${migrationDir}/${getMigrationFileNameFromRecord(latest)}`;

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

    return [ migrationDir ]; // return migration output path
};