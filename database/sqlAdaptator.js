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
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const {singular} = require('pluralize');

// project imports
const utils = require('../actions/lib/utils');
const env = require('./databaseEnv');

// sql connection
let db = mysql.createConnection({
    host: env.host,
    user: env.user,
    password: env.pwd,
    database: env.database,
    port: env.port
});

// promisified
const query = util.promisify(db.query.bind(db));
const connect = util.promisify(db.connect.bind(db));

/**
 * @description Get table foreign keys
 * @param {string} tableName Table name
 * @returns {Promise<array>} Foreign keys
 */
exports.getForeignKeys = async (tableName) => {
    return await query(`SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA='${env.database}' AND TABLE_NAME='${tableName}';`);
};

/**
 * @typedef {object} InsertedUser
 * @property {string} login User email
 * @property {string} password User password
 */

/**
 * @description Generate a random password hash it, create a super user, write in in the database, then write the credential in a file
 * @param {string} username
 * @returns {Promise<InsertedUser>}
 */
exports.insertAdmin = async (username) => {
    let password = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 24; i++)
        password += possible.charAt(Math.floor(Math.random() * possible.length));
    let hashed = await bcrypt.hash(password, 10);
    await query(`INSERT INTO user(username, email, firstname, lastname, services, role, password) VALUES('${username}', '${username}@localhost.com','${username}','${username}','{}','admin', '${hashed}')`);
    return {
        login: `${username}@localhost.com`,
        password
    };
};

/**
 * @description Deletes a table from database
 * @param {string} tableName
 * @returns {Promise<number>} Number of deleted records
 */
exports.dropTable = async (tableName) => {
    return await query(`DROP TABLE ${tableName};`);
};

/**
 * @param {string} tableName Table name
 * @description Get all data related to columns of a table
 * @returns {Promise<array>} Column data
 */
exports.getColumns = async (tableName) => {
    return await query(`SHOW COLUMNS FROM ${tableName} ;`);
};


/**
 * @description Check if table exists
 * @param {string} tableName Table name
 * @returns {Promise<boolean>} Exists
 */
exports.tableExists = async (tableName) => {
    let result = await query(`
    SELECT COUNT(*) as 'count'
    FROM information_schema.tables
    WHERE table_schema = '${env.database}'
    AND table_name = '${tableName}';
  `).catch(() => [{count: false}]);
    return result[0].count > 0;
};

/**
 * @returns Get all table names in database
 * @returns {Promise<array>} Tables
 */
exports.getTables = async () => {
    return await query(`SHOW TABLES`);
};

/**
 * @description as name of table are given in a associative array where the field which contains the table is Tables_In_dbName . i need this so that
 * i can get the correct field
 *
 * @returns {string} Tables_in_dbName
 */
exports.getTablesInName = () => {
    return "Tables_in_" + env.database.replace('-', '_');
};


/**
 * @description Dump all database into file
 * @param {string} path
 * @returns {Promise<void>}
 */
exports.dumpAll = async (path) => {
    // dump the result straight to a file
    await mysqldump({
        connection: {
            host: env.host,
            user: env.user,
            password: env.pwd,
            database: env.database,
        },
        dumpToFile: path + '.sql',
    });
};

/**
 * @description Dump a table into file
 * @param {string} table
 * @param {string} path
 * @returns {Promise<void>}
 */
exports.dumpTable = async (table, path) => {
    // dump the result straight to a file
    await mysqldump({
        connection: {
            host: env.host,
            user: env.user,
            password: env.pwd,
            database: env.database,
        },
        dump: {
            tables: [table]
        },
        dumpToFile: path + '.sql',
    })
};

/**
 * @description Select fields from a table
 * @param {string[]} fields
 * @param {string} table
 * @returns {Promise<array>} query results
 */
exports.select = async (fields, table) => {
    let fieldValue = '';
    fields.forEach(field => {
        fieldValue += field + ",";
    });
    fieldValue = fieldValue.substr(0, fieldValue.length - 1);
    return await query(`SELECT ${fieldValue} from  ${table}`);
};

/**
 * @description Check if the database is reachable, if not process exit with error message
 * @return {Promise<void>}
 */
exports.checkConnexion = async () => {
    const connect = util.promisify(db.connect.bind(db));
    await connect().catch(err => {
        if (err) {
            console.log(chalk.red("Database is unreachable"));
            process.exit(0);
        }
    });
};

/**
 * @description tries to connect to database , can throw an error
 * @returns {Promise<void>}
 */
exports.tryConnect = async () => {
    return await connect();
};


/**
 * @description Creates the env database
 * Need to create a tmpConnection otherwise it will throw an error because the database does not exists
 * @returns Promise<void>
 */
exports.createDatabase = async () => {
    let tmpConnection = mysql.createConnection({
        host: env.host,
        user: env.user,
        password: env.pwd,
        port: env.port
    });
    const tmpQuery = util.promisify(tmpConnection.query.bind(tmpConnection));
    return await tmpQuery(`CREATE DATABASE IF NOT EXISTS ${env.database}`);
};


/**
 * @param {string} tableName
 * @description Call getColumns function in correct adapator to get data of columns
 * @returns {tableData} data of a table
 */
exports.getTableInfo = async (tableName) => {
        let p_columns = module.exports.getColumns(tableName);
        let p_foreignKeys = module.exports.getForeignKeys(tableName);
        let [columns, foreignKeys] = await Promise.all([p_columns, p_foreignKeys]);
        return {columns, foreignKeys};
};

/**
 * @description TODO
 * @param model1
 * @param model2
 * @returns {Promise<void>}
 */
exports.DropBridgingTable = async (model1, model2) => {
    model1 = singular(model1);
    model2 = singular(model2);
    let result = await query(`SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = 'testType' 
    AND (REFERENCED_TABLE_NAME ='${model1}' 
    OR REFERENCED_TABLE_NAME='${model2}');
  `);
    for (let i = 0; i < result.length; i++) if (utils.isBridgindTable(await module.exports.getTableInfo(result[i].TABLE_NAME))) await module.exports.dropTable(result[i].TABLE_NAME);
};
