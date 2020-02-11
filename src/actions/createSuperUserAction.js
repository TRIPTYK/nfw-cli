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
module.exports = async ({username,mail,role,password}) => {
    const sqlConnection = await getSqlConnectionFromNFW();

    let credentials = await sqlConnection.insertAdmin({username,mail,role,password});
    const credentialsFileName = `${credentials.login}-credentials.json`;
    const credentialsTemplate = fs.readFileSync(`${__baseDir}/templates/custom/userCredentials.ejs`,'utf-8');

    const compiled = ejs.compile(credentialsTemplate)({
        login: credentials.login,
        password: credentials.password
    });

    fs.writeFileSync(credentialsFileName, compiled);

    return [credentialsFileName];
};