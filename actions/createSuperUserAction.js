/**
 * @module createSuperAction
 * @description creates a super user
 * @author Deflorenne Amaury
 */

// node modules
const fs = require('fs');
const ejs = require('ejs');

const { getSqlConnectionFromNFW } = require('../database/sqlAdaptator');

/**
 * Main function
 * @param username
 * @returns {Promise<string[]>}
 */
module.exports = async (username) => {
    const sqlConnection = await getSqlConnectionFromNFW();

    let credentials = await sqlConnection.insertAdmin(username);
    const credentialsFileName = 'credentials.json';
    const credentialsTemplate = fs.readFileSync(`${__baseDir}/templates/custom/userCredentials.ejs`,'utf-8');

    const compiled = ejs.compile(credentialsTemplate)({
        login: credentials.login,
        password: credentials.password
    });

    fs.writeFileSync(credentialsFileName, compiled);

    return [credentialsFileName];
};