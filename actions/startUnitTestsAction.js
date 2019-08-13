/**
 * @module startUnitTestsAction
 * @description Starts mocha unit tests
 * @author Antoine Samuel
 * @author Deflorenne Amaury
 */

// Node modules
const util = require('util');
const exec = util.promisify(require('child_process').exec);

/**
 * @description Returns how many unit test passed, failed, and which one failed
 * @returns {Array.string}
 */
module.exports = async () => {
    const { stdout } = await exec(`${path.normalize('./node_modules/.bin/mocha')} --require ts-node/register/transpile-only ./test/*.ts --reporter spec --timeout 10000 --colors --exit`)
      .catch((e) => e); // Throws error when the unit test fails , need to catch and return the stdout

    console.log(stdout);
};
