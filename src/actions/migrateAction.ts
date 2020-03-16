/**
 * @author Antoine Samuel
 * @author Deflorenne Amaury
 * @description Generate and executes a migration
 * @module migrateAction
 */

 import { AdaptatorStrategy } from "../database/AdaptatorStrategy";

// Node modules
import JsonFileWriter = require("json-file-rw");
import util = require('util');
import fs = require('fs');
import chalk from 'chalk';
const mkdirp = util.promisify(require('mkdirp'));
import child_process = require('child_process');
import path = require('path');
import project = require('../utils/project');
import Log = require('../utils/log');
import { MongoConnection } from "../database/mongoAdaptator";
import { SqlConnection } from "../database/sqlAdaptator";
import { DatabaseEnv } from "../database/DatabaseEnv";


const _buildErrorObjectFromMessage = (e: Error) => {
    const msgReg = /^\s*(\w+):\s*([ -+|\--z]*),?/gm;
    let m;
    let errObj = <any>{};

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

/*
 * Main function
 * @param modelName
 * @param restore
 * @param dump 
 * @returns {Promise<array>}
 */
export class MigrateActionClass {

    strategy: AdaptatorStrategy
    modelName: string;
    restore?:boolean;
    dump?: boolean;
    isRevert?: Boolean;

    constructor(strategy: AdaptatorStrategy, modelName: string, restore?: boolean, dump?: boolean, isRevert?: boolean){
        this.strategy = strategy;
        this.modelName = modelName;
        this.restore = restore;
        this.dump = dump;
        this.isRevert = isRevert;
    }

    setStrategy (strategy: AdaptatorStrategy){
        this.strategy = strategy;
    }

    async main(){

        const ormConfig = new JsonFileWriter();
        ormConfig.openSync("./ormconfig.json");
        const connection = await this.strategy.getConnectionFromNFW();

        //const db: promisemysql.Connection;

        const getMigrationFileNameFromRecord = (record: any) => record.timestamp + '-' + record.name.replace(record.timestamp.toString(),'');

        const nfwConfig = new JsonFileWriter();
        nfwConfig.openSync(".nfw");
        const currentEnv = nfwConfig.getNodeValue("env","development");
        const envValues = new DatabaseEnv(`${currentEnv}.env`).getEnvironment();

        await mkdirp(`src/migration/${currentEnv}/failed`);

        const migrationDir = ormConfig.getNodeValue("cli.migrationsDir");

        const migrationConfig = new JsonFileWriter();
        migrationConfig.openSync('./src/migration/migration.cfg');
        if (!migrationConfig.fileExists) {
            migrationConfig.setNodeValue('current','last');
        }

        ormConfig.saveSync();

        if (this.restore) {
            const formatMigrationArray = (array: string[]) => array.map(table => Object.values(table)[0]);

            let [revertTo] = await connection.select( 'migration_table',['timestamp', 'name'],`WHERE name LIKE '${this.modelName}%' ORDER BY timestamp DESC`);
            const dump = fs.readFileSync(`${migrationDir}/${getMigrationFileNameFromRecord(revertTo)}.sql`, 'utf-8');

            await connection.db.query("SET FOREIGN_KEY_CHECKS = 0;");
            const allTables = formatMigrationArray(await connection.getTables()).filter((file) =>  file !== 'migration_table');
            await Promise.all(allTables.map((table) => connection.db.query(`TRUNCATE TABLE ${table};`)));
            await connection.db.query("SET FOREIGN_KEY_CHECKS = 1;");
            await connection.db.query(dump);
        }
        else if(this.isRevert) {
            const formatMigrationArray = (array: string[]) => array.map(table => Object.values(table)[0]);

            let [[revertTo] , [current]] = await Promise.all([
                connection.select( 'migration_table',['timestamp', 'name'],`WHERE name LIKE '${this.modelName}%' ORDER BY timestamp DESC`),
                migrationConfig.getNodeValue('current') === 'last' ? connection.select( 'migration_table',['timestamp', 'name'],`ORDER BY timestamp DESC`) : connection.select( 'migration_table',['timestamp', 'name'],`WHERE name = '${migrationConfig.getNodeValue('current')}' ORDER BY timestamp DESC`)
            ]); 

            const between = await connection.select('migration_table',['timestamp','name'],`WHERE timestamp BETWEEN ${revertTo.timestamp} AND ${current.timestamp} ORDER BY timestamp DESC`);

            if (revertTo.length === 0) throw new Error('Revert migration not found');
            if (revertTo.timestamp >= current.timestamp) throw new Error('You are trying to revert to the same or a newer migration , please do a simple nfw migrate');

            migrationConfig.setNodeValue("current",revertTo.name);
            //let dump = fs.readFileSync(`${migrationDir}/${getMigrationFileNameFromRecord(revertTo)}.sql`, 'utf-8');
            let errors = 0 , success = 0;

            await connection.db.query("SET FOREIGN_KEY_CHECKS = 0;");

            for (let forMigration of between) {
                let forMigrationFileName = getMigrationFileNameFromRecord(forMigration);
                const migrationFile = project.getSourceFile(`${migrationDir}/${forMigrationFileName}.ts`);

                const functionText = migrationFile.getClasses()[0].getMethod('down').getText(); // get the class and method text
                console.log(functionText)
                const regexDownStatement = /\"(.*?)\"/gm; // extract sql statements
                let res;

                while ((res = regexDownStatement.exec(functionText)) !== null) {
                    await connection.db.query(res[1])
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
            await Promise.all(allTables.map((table) => connection.db.query(`TRUNCATE TABLE ${table};`)));
            await connection.db.query("SET FOREIGN_KEY_CHECKS = 1;");
            //await connection.query(dump);

            migrationConfig.saveSync();

        }else{

            const typeorm_cli = path.resolve('.', 'node_modules', 'typeorm', 'cli.js');
            const ts_node = path.resolve('.', 'node_modules', '.bin', 'ts-node');   

            //typeorm generate feature currently doesn't work with mongodb so an empty migration is created when using Mongodb
            //To use migrations with a Mongo database, migrations must be written by hand in src/migration/development/migration_name
            if(this.strategy instanceof MongoConnection){
                child_process.spawnSync(`${ts_node} ${typeorm_cli} migration:create -n ${this.modelName}`, {stdio : 'inherit', shell: true});
            } else {
                child_process.spawnSync(`${ts_node} ${typeorm_cli} migration:generate -n ${this.modelName}`, { stdio : 'inherit',shell: true });
            }

            
            const files = fs.readdirSync(migrationDir,{withFileTypes : true}).filter(dirent => !dirent.isDirectory())
            .map(dirent => dirent.name);

            const recentTimestamp = Math.max.apply(null,files.map((e) => {
                return parseInt(e.split("-")[0],10);
            }));
            
            const migrationFile = `${recentTimestamp}-${this.modelName}.ts`;

            try {
                child_process.spawnSync(`${ts_node} ${typeorm_cli} migration:run`,{ stdio : 'inherit',shell: true});
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
        
        if(this.dump){

            if(this.strategy instanceof MongoConnection) {
                
                child_process.spawnSync(`mongodump --host=${envValues.TYPEORM_HOST} --port=${envValues.TYPEORM_PORT} --username=${envValues.TYPEORM_USER} --password=${envValues.TYPEORM_PWD} --db=${envValues.TYPEORM_DB} --authenticationDatabase=admin -o ./dist/migration/dump`, 
                {stdio : 'inherit', shell: true});
            }

            if(this.strategy instanceof SqlConnection) {

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

        }

        return [ migrationDir ]; // return migration output path
    }
};