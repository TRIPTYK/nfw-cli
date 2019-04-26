/**
 * @module sqlAdapatator
 * @description Fetch data from an sql database
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 */

// project modules
const mysql = require('mysql');
const util = require('util');
const mysqldump = require('mysqldump');
const bcrypt = require('bcrypt');
const {singular} = require('pluralize');
const dotenv = require('dotenv');
const fs = require('fs');

// project imports
const utils = require('../actions/lib/utils');

class DatabaseEnv
{
    /**
     *
     * @param {string} path
     */
    constructor(path)
    {
        if (typeof path === "string")
            this.loadFromFile(path);
        if (typeof path === "object")
            this.envVariables = path;
    }

    loadFromFile(path)
    {
        this.envVariables = dotenv.config({path: path}).parsed;
    }

    getEnvironment()
    {
        return this.envVariables;
    }
}

class SqlConnection
{
    /**
     *
     * @param {DatabaseEnv} env
     */
    constructor(env = null)
    {
        if (env)
            this.environement = env.getEnvironment();
    }

    /**
     *
     * @param {DatabaseEnv} env
     */
    async connect(env = null)
    {
        if (!env)
            env = this.environement;

        this.db = mysql.createConnection({
            host: env.TYPEORM_HOST,
            user: env.TYPEORM_USER,
            password: env.TYPEORM_PWD,
            database: env.TYPEORM_DB,
            port: env.TYPEORM_PORT
        });

        const connect = util.promisify(this.db.connect).bind(this.db);
        await connect();
        this.query = util.promisify(this.db.query).bind(this.db);
    }

    /**
     *
     * @param tableName
     * @returns {Promise<{foreignKeys: *, columns: *}>}
     */
    async getTableInfo(tableName)
    {
        let p_columns = this.getColumns(tableName);
        let p_foreignKeys = this.getForeignKeys(tableName);
        let [columns, foreignKeys] = await Promise.all([p_columns, p_foreignKeys]);
        return {columns, foreignKeys};
    }

    /**
     *
     * @param model1
     * @param model2
     * @returns {Promise<void>}
     */
    async dropBridgingTable(model1,model2)
    {
        model1 = singular(model1);
        model2 = singular(model2);
        let result = await this.query(`SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
            WHERE CONSTRAINT_SCHEMA = '${this.environement.database}' 
            AND (REFERENCED_TABLE_NAME ='${model1}' 
            OR REFERENCED_TABLE_NAME='${model2}');
        `);
        for(let i=0 ; i<result.length ; i++)
            if(utils.isBridgindTable(await module.exports.getTableInfo(result[i].TABLE_NAME)))
                await module.exports.dropTable(result[i].TABLE_NAME);
    }

    /**
     *
     * @returns {Promise<any | void>}
     */
    async getTables()
    {
        return await this.query(`SHOW TABLES`);
    }

    /**
     *
     * @param tableName
     * @returns {Promise<any | void>}
     */
    async getForeignKeys(tableName) {
        return await this.query(`SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA='${this.environement.database}' AND TABLE_NAME='${tableName}';`);
    };

    /**
     *
     * @param username
     * @returns {Promise<{password: (string|string), login: string}>}
     */
    async insertAdmin(username)
    {
        let password = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 24; i++)
            password += possible.charAt(Math.floor(Math.random() * possible.length));
        let hashed = await bcrypt.hash(password, 10);
        await this.query(`INSERT INTO user(username, email, firstname, lastname, services, role, password) VALUES('${username}', '${username}@localhost.com','${username}','${username}','{}','admin', '${hashed}')`);
        return {
            login: `${username}@localhost.com`,
            password
        };
    }

    /**
     *
     * @param tableName
     * @returns {Promise<boolean>}
     */
    async tableExists(tableName) {
        let result = await this.query(`
            SELECT COUNT(*) as 'count'
            FROM information_schema.tables
            WHERE table_schema = '${env.database}'
            AND table_name = '${tableName}';
        `).catch(() => [{count: false}]);
        return result[0].count > 0;
    }

    /**
     *
     * @param tableName
     * @returns {Promise<any | void>}
     */
    async getColumns(tableName)
    {
        return await this.query(`SHOW COLUMNS FROM ${tableName} ;`);
    }

    /**
     *
     * @param table
     * @param fields
     * @returns {Promise<any | void>}
     */
    async select(table,fields)
    {
        return await this.query(`SELECT ${fields} from  ${table}`);
    }

    /**
     *
     * @param databaseName
     * @returns {Promise<any | void>}
     */
    async createDatabase(databaseName)
    {
        return await this.query(`CREATE DATABASE IF NOT EXISTS ${databaseName}`);
    }

    /**
     *
     * @param tableName
     * @returns {Promise<void>}
     */
    async deleteForeignKeys(tableName)
    {
        let result = await this.query(`SELECT COLUMN_NAME,CONSTRAINT_NAME,TABLE_NAME 
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE REFERENCED_TABLE_SCHEMA='${env.database}' 
        AND REFERENCED_TABLE_NAME='${tableName}';
        `);
        for(let i=0 ; i<result.length ; i++) {
            if(utils.isBridgindTable(await module.exports.getTableInfo(result[i].TABLE_NAME)))
                await this.dropTable(result[i].TABLE_NAME);
            else {
                await query(`ALTER TABLE ${result[i].TABLE_NAME} DROP FOREIGN KEY ${result[i].CONSTRAINT_NAME}, DROP ${result[i].COLUMN_NAME}`);
            }
        }
    }

    /**
     *
     * @param tableName
     * @returns {Promise<any | void>}
     */
    async dropTable(tableName)
    {
        return await this.query(`DROP TABLE ${tableName};`);
    }

    /**
     *
     * @param env
     * @param path
     * @param table
     * @returns {Promise<void>}
     */
    static async dumpTable(env,path,table)
    {
        await mysqldump({
            connection: env.getEnvironment(),
            dumpToFile: path + '.sql',
            dump: {
                tables: [table]
            }
        });
    }

    /**
     *
     * @param env
     * @param path
     * @returns {Promise<void>}
     */
    static async dumpAll(env,path)
    {
        await mysqldump({
            connection: env.getEnvironment(),
            dumpToFile: path + '.sql',
        });
    }
}

exports.DatabaseEnv = DatabaseEnv;
exports.SqlConnection = SqlConnection;

exports.getSqlConnectionFromNFW = async () => {
    const nfwFile = fs.readFileSync('.nfw','utf-8');
    let nfwEnv = JSON.parse(nfwFile).env;

    if (!nfwEnv)
        nfwEnv = 'development';

    const connection =  new SqlConnection(new DatabaseEnv(`${nfwEnv.toLowerCase()}.env`));
    await connection.connect();
    return connection;
};