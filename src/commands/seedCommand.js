// node modules 

const main = require('../actions/seedAction')

/**
 * Yargs command syntax
 * @type {string}
 */

exports.command = 'seed';
/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'read database and write json/xlsx file or read json/xlsx file and write in database';

/**
 *  Yargs command builder
 */


/**
 * Main function
 * 
 * @return {Promise<void>}
 */
exports.handler = async () => {
    await main();

}
