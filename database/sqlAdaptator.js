/**
 * @module sqlAdapatator
 * @author Verliefden Romain
 * @description this module provide method to get data from a sql database.
 * @exports getColumns
 * @exports getTables
 * @exports getTablesInName
 * @exports dropTable
 * @exports tableExists
 * @exports insertAdmin
 * @exports getForeignKeys
 * @exports dumpAll
 * @exports dumpTable
 * @exports select
 * @exports checkConnexion
 */
const mysql = require('mysql');
const env = require('./databaseEnv');
const util = require('util');
const mysqldump = require('mysqldump');
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const utils = require('../actions/lib/utils');
const {singular} = require('pluralize');

var db = mysql.createConnection({
    host: env.host,
    user: env.user,
    password: env.pwd,
    database: env.database,
    port: env.port
});

const query = util.promisify(db.query.bind(db));
const connect = util.promisify(db.connect.bind(db));

/**
 * @description : get table foreign keys
 * @param {string} tableName
 * @returns {Array} query results
 */
exports.getForeignKeys = async (tableName) => {
    return await query(`SELECT TABLE_NAME,COLUMN_NAME,CONSTRAINT_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE REFERENCED_TABLE_SCHEMA='${env.database}' AND TABLE_NAME='${tableName}';`);
};

/**
 * @description Generate a random password hash it, create a super user, write in in the database, then write the credential in a file
 * @param {string} username
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
 * @description : deletes a table
 * @param {string} tableName
 * @returns {Array} query results
 */
exports.dropTable = async (tableName) => {
    return await query(`DROP TABLE ${tableName};`);
};

/**
 * @param {string} tableName
 * @description get all data related to columns of a table
 * @returns {Array} query results
 */
exports.getColumns = async (tableName) => {
    return await query(`SHOW COLUMNS FROM ${tableName} ;`);
};


/**
 * @description checks if table exists
 * @param {string} tableName
 * @returns {boolean} true/false
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
 * @returns get all name of table in a database
 * @returns {Array} query results
 */
exports.getTables = async () => {
    result = await query(`SHOW TABLES`);
    return result;
};

/**
 * @description as name of table are given in a associative array where the field wich contains the table is Tables_In_dbName . i need this so that
 * i can get the correct field
 *
 * @returns {string} Tables_in_dbName
 */
exports.getTablesInName = () => {
    return "Tables_in_" + env.database.replace('-', '_');
};


/**
 * @description dump all into file
 * @param {string} path
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
 * @description dump a table into file
 * @param {string} table
 * @param {string} path
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
 * @description select Fields from a table
 * @param {string[]} fields
 * @param {string} table
 * @returns {Array} query results
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
 * @description CHeck if the datapase if reachable, if not process exit with error message
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
 */
exports.tryConnect = async () => {
    return await connect();
};


/**
 * creates the env database
 * Need to create a tmpConnection otherwise it will throw an error because the database does not exists
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
 * @param {string} dbType
 * @param {string} tableName
 * @description call getColumns function in correct adapator to get data of columns
 * @returns {object} data of a table
 */
exports.getTableInfo = async (tableName) => {
        let p_columns = module.exports.getColumns(tableName);
        let p_foreignKeys = module.exports.getForeignKeys(tableName);
        let [columns, foreignKeys] = await Promise.all([p_columns, p_foreignKeys]);
        return {columns, foreignKeys};
};

exports.DropBridgingTable = async (model1,model2) => {
    model1 = singular(model1);
    model2 = singular(model2)
    let result = await query(`SELECT DISTINCT TABLE_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS 
    WHERE CONSTRAINT_SCHEMA = '${env.database}' 
    AND (REFERENCED_TABLE_NAME ='${model1}' 
    OR REFERENCED_TABLE_NAME='${model2}');
  `) 
   for(let i=0 ; i<result.length ; i++) if(utils.isBridgindTable(await module.exports.getTableInfo(result[i].TABLE_NAME))) await module.exports.dropTable(result[i].TABLE_NAME);
};

exports.DeleteForeignKeys = async (model1) =>{

}


//SELECT CONSTRAINT_NAME,TABLE_NAME FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS      WHERE CONSTRAINT_SCHEMA = 'testType'      AND REFERENCED_TABLE_NAME ='hey';
