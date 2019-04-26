/**
 * @module databaseInfo
 * @description middleware function get database infos from a database adaptor
 * @author Deflorenne Amaury
 * @author Verliefden Romain
 */
const { getSqlConnectionFromNFW } = require('./sqlAdaptator');
const Log = require('../utils/log');

/**
 * @param {string} dbType can be "sql" , "mongodb" . Only sql is supported at the moment
 * @param {string} tableName
 * @description Call getColumns function in correct adapter to get data of columns
 * @return {object}
 */
exports.getTableInfo = async (dbType, tableName) => {
    const sqlAdaptor = await getSqlConnectionFromNFW();

    if (dbType === "sql") {
        let p_columns = sqlAdaptor.getColumns(tableName);
        let p_foreignKeys = sqlAdaptor.getForeignKeys(tableName);
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
 * @returns {boolean} Table exists
 */
exports.tableExistsInDB = async (tableName) => {
    const sqlAdaptor = await getSqlConnectionFromNFW();

    return (
        await sqlAdaptor.tableExists(tableName)
            .catch(() => {
                Log.error("Failed to connect to database");
                return false;
            })
    );
};
