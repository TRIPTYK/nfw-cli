/**
 * @module startUnitTestsAction
 * @description Starts mocha unit tests
 * @author Antoine Samuel
 * @author Deflorenne Amaury
 */

// Node modules
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Project modules
const commands = require('../static/commands');

/**
 * @description Returns how many unit test passed, failed, and which one failed
 * @returns {Array.string}
 */
module.exports = async () => {
    let command = commands.unitTests;

    const { stdout } = await exec(command)
      .catch((e) => e); // Throws error when the unit test fails , need to catch and return the stdout

    console.log(stdout);
};
