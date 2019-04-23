/**
 * @module editEnvAction
 * @author Samuel Antoine
 * @description Edit existing environment file
 */

// Node modules
const fs = require('fs');

// Project modules
const inquirer = require('../utils/inquirer');

/**
 * Main function
 * @param env
 * @param chosenOne
 * @returns {Promise<string[]>} Written files
 */
module.exports = async (env, chosenOne) => {
    let response = await inquirer.editEnvFile(chosenOne);

    response.NODE_ENV = env;
    response.API_VERSION = "v1";
    response.PORT = parseInt(response.PORT);
    response.JWT_EXPIRATION_MINUTES = parseInt(response.JWT_EXPIRATION_MINUTES);
    response.JIMP_SIZE_XS = parseInt(response.JIMP_SIZE_XS);
    response.JIMP_SIZE_MD = parseInt(response.JIMP_SIZE_MD);
    response.JIMP_SIZE_XL = parseInt(response.JIMP_SIZE_XL);

    if (response.HTTPS_IS_ACTIVE === false) {
        response.HTTPS_IS_ACTIVE = 0;
    } else {
        response.HTTPS_IS_ACTIVE = 1;
    }

    if (response.JIMP_IS_ACTIVE === false) {
        response.JIMP_IS_ACTIVE = 0;
    } else {
        response.JIMP_IS_ACTIVE = 1;
    }

    let envString = JSON.stringify(response, null, '\n');
    let reg = /"(.*)":\s*(".*"|\d+)/gm; // select all key / value from env

    let output = envString
        .replace(reg, `$1 = $2`)
        .replace('{', "")
        .replace('}', '')
        .replace(/(,)(?!.*,)/gm, "");

    const writeFileName = `${env}.env`;

    fs.writeFileSync(writeFileName, output);

    return [writeFileName];
};

