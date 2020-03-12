/**
 * @module sqlAdapatator
 * @description Fetch data from an sql database
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 */

// project modules
//import mysql = require('mysql');
import util = require('util');
import SQLBuilder = require('json-sql-builder2');
import mysqldump from 'mysqldump';
import bcrypt = require('bcryptjs');
import {singular} from 'pluralize';
import dotenv = require('dotenv');
import fs = require('fs');
import * as promisemysql from 'promise-mysql';

// project imports
import utils = require('../actions/lib/utils');
import { DatabaseEnv } from './DatabaseEnv';
import { AdaptatorStrategy } from './AdaptatorStrategy';

export class SqlConnection implements AdaptatorStrategy {

    environement: any;

    db: promisemysql.Connection;

    constructor(env: DatabaseEnv = null)
    {
        if (env)
            this.environement = env.getEnvironment();
    }

    async connect(env: {[key:string] : any} = null): Promise<void>
    {

        if (!env){
            env = this.environement;
        }

        this.db = await promisemysql.createConnection({
            host: env.TYPEORM_HOST,
            user: env.TYPEORM_USER,
            password: env.TYPEORM_PWD,
            database: env.TYPEORM_DB,
            port: env.TYPEORM_PORT,
            multipleStatements : true
        });

        const connect = util.promisify(this.connect).bind(this.db);
        //await connect;
        this.db.query = util.promisify(this.db.query).bind(this.db);
        
    }

    async getTableInfo(tableName: string): Promise<{foreignKeys: any, columns: any}>
    {
        let p_columns = this.getColumns(tableName);
        let p_foreignKeys = this.getForeignKeys(tableName);
        let [columns, foreignKeys] = await Promise.all([p_columns, p_foreignKeys]);
        return {columns, foreignKeys};
    }

    async dropBridgingTable(model1: string,model2: string): Promise<any>
    {
        model1 = singular(model1);
        model2 = singular(model2);
        let result = await this.db.query(`SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
            WHERE CONSTRAINT_SCHEMA = '${this.environement.TYPEORM_DB}' 
            AND (REFERENCED_TABLE_NAME ='${model1}' 
            OR REFERENCED_TABLE_NAME='${model2}');
        `) 
        for(let i=0 ; i<result.length ; i++)
            if(utils.isBridgindTable(await module.exports.getTableInfo(result[i].TABLE_NAME)))
                await module.exports.dropTable(result[i].TABLE_NAME);
    }

    async getTables(): Promise<any>
    {
        return await this.db.query(`SHOW TABLES`);
    }

    async getForeignKeys(tableName: string): Promise<any> {
        return await this.db.query(`SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA='${this.environement.TYPEORM_DB}' AND TABLE_NAME='${tableName}';`);
    };

    async insertAdmin({username, mail, role = 'admin', password}): Promise<{login: string, password: (string|string)}>
    {   
        if (!mail) {
            mail = `${username}@localhost.com`;
        }

        if (!password) {
            password = "";
            let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            for (let i = 0; i < 24; i++)
                password += possible.charAt(Math.floor(Math.random() * possible.length));
        }

        let hashed = await bcrypt.hash(password, 10);
        await this.db.query(`INSERT INTO user(username, email, firstname, lastname, role, password) VALUES('${username}', '${mail}','${username}','${username}','${role}', '${hashed}')`);
        
        return {
            login: mail,
            password
        };
    }

    async tableExists(tableName: string): Promise<boolean> {
        let result = await this.db.query(`
            SELECT COUNT(*) as 'count'
            FROM information_schema.tables
            WHERE table_schema = '${this.environement.TYPEORM_DB}'
            AND table_name = '${tableName}';
        `).catch(() => [{count: false}]);
        return result[0].count > 0;
    }

    async getColumns(tableName:string): Promise<any>
    {
        return await this.db.query(`SHOW COLUMNS FROM ${tableName} ;`);
    }

    async select(table: string,fields: string[],supplement = ''): Promise<any>
    {
        return await this.db.query(`SELECT ${fields} from  ${table} ${supplement}`);
    }

    async createDatabase(databaseName: string): Promise<any>
    {
        return await this.db.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
    }

    async dropTable(tableName: string): Promise<any>
    {
        return await this.db.query(`DROP TABLE ${tableName};`);
    }

    async truncateTable(tableName: string): Promise<void> {
        
        return await this.db.query(`TRUNCATE TABLE ${tableName}`);
    }
    
    async selectFromTable(tableName: string, colName: string): Promise<any> {

        let results = [];
        results = await this.db.query(`SELECT ${colName} AS res FROM ${tableName} LIMIT 1`);

        if(typeof results === 'undefined' || results.length === 0) {
            return '';
        } else {
            return results[0].res;
        }
    }

    async insertIntoTable (table: string, columns: any, values: any): Promise<void> {

        const sql = new SQLBuilder('MySQL');
        const myQuery = sql.$insert({
            $table: table,
            $columns: columns,
            $values: values
        });

        return await this.db.query(myQuery);
    }

    //description: Delete all foreignKeys that point to a specific table
    async getForeignKeysRelatedTo (tableName: string): Promise<any>
    {
        return await this.db.query(`SELECT REFERENCED_TABLE_NAME,TABLE_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE REFERENCED_TABLE_SCHEMA='${this.environement.TYPEORM_DB}' 
        AND REFERENCED_TABLE_NAME='${tableName}'
        OR TABLE_NAME='${tableName}'
        AND REFERENCED_TABLE_NAME IS NOT NULL;
        `);
    }

    //description: return number table of databse 
    async getTablesCount(database: string){
        let result = await this.db.query(`SELECT count(*) AS TOTALNUMBEROFTABLES 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = '${database}'`);
    return result[0].TOTALNUMBEROFTABLES ;
    }

    async dumpTable(path: string | object,table: string): Promise<void>
    {
        await mysqldump({
            connection: {
                host: this.environement.TYPEORM_HOST,
                user: this.environement.TYPEORM_USER,
                password: this.environement.TYPEORM_PWD,
                database: this.environement.TYPEORM_DB,
                port : parseInt(this.environement.TYPEORM_PORT),
            },
            dumpToFile: path + '.sql',
            dump: {
                tables: [table]
            }
        });
    }

    async dumpAll(path: string | object,{dumpOptions}): Promise<any>
    {
        const options = {
            connection: {
                host: this.environement.TYPEORM_HOST,
                user: this.environement.TYPEORM_USER,
                password: this.environement.TYPEORM_PWD,
                database: this.environement.TYPEORM_DB,
                port : parseInt(this.environement.TYPEORM_PORT),
            },
            dump : dumpOptions
        };

        if (path !== null) {
            options['dumpToFile'] = path + '.sql';
        }

        return mysqldump(options);
    }

    async getConnectionFromNFW () {

        const nfwFile = fs.readFileSync('.nfw','utf-8');
        let nfwEnv = JSON.parse(nfwFile).env;
    
        if (!nfwEnv)
            nfwEnv = 'development';
    
        const connection =  new SqlConnection(
            new DatabaseEnv(`${nfwEnv.toLowerCase()}.env`)
        );
        await connection.connect();
        return connection;
    };
}

//exports.DatabaseEnv = DatabaseEnv;
//exports.SqlConnection = SqlConnection;

