/**
 * @module generateDocumentationAction
 * @author Deflorenne Amaury
 * @description Executes Typedoc generation
 */

// node modules
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

/**
 * Main function
 * @returns {Promise<void | string | Buffer>}
 */
module.exports = async () => {
    return await exec(`${path.normalize('./node_modules/.bin/typedoc')} --out ./docs --ignoreCompilerErrors`);
};