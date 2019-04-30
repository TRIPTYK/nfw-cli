/**
 * @module generateDocumentationAction
 * @author Deflorenne Amaury
 * @description Executes Typedoc generation
 */

// node modules
const util = require('util');
const exec = util.promisify(require('child_process').exec);

//project modules
const commands = require('../static/commands');

/**
 * Main function
 * @returns {Promise<void | string | Buffer>}
 */
module.exports = async () => {
    return await exec(commands.generateDoc);
};