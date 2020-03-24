/**
 * @module generateDocumentationAction
 * @author Deflorenne Amaury
 * @description Executes Typedoc generation
 */

// node modules
import util = require('util');
const exec = util.promisify(require('child_process').exec);
import path = require('path');

/**
 * Main function
 * @returns {Promise<void | string | Buffer>}
 */

export class GenerateDocumentationActionClass{

    async main(){
        return await exec(`${path.normalize('./node_modules/.bin/typedoc')} --out ./docs --ignoreCompilerErrors`);
    }
}
