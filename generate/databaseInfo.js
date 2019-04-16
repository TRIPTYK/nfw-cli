/**
 * @module databaseInfo
 * @exports getTableInfo
 * @exports tableExistsInDB
 */
const sqlAdaptator = require('../database/sqlAdaptator');
const Log = require('../utils/log');

/**
 * @param {string} dbType
 * @param {string} tableName
 * @description call getColumns function in correct adapator to get data of columns
 * @returns {object} data of a table
 */
exports.getTableInfo = async (dbType, tableName) => {
    if (dbType === "sql") {
        let p_columns = sqlAdaptator.getColumns(tableName);
        let p_foreignKeys = sqlAdaptator.getForeignKeys(tableName);
        let [columns, foreignKeys] = await Promise.all([p_columns, p_foreignKeys]);

        return {columns, foreignKeys};
    } else {
        Log.rainbow(dbType + " is not supported by this method yet");
        process.exit(0);
    }
    return {columns: [], foreignKeys: []};
};


/**
 * @param {string} tableName
 * @description Check if table exists in database
 * @returns {boolean} table exists
 */
exports.tableExistsInDB = async (tableName) => {
    return (
        await sqlAdaptator.tableExists(tableName)
            .catch(() => {
                Log.error("Failed to connect to database");
                return false;
            })
    );
};
