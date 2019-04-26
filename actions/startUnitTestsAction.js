/**
 * @module startUnitTestsAction
 * @description Starts mocha unit tests
 * @author Antoine Samuel
 * @author Deflorenne Amaury
 */

// Node modules
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require('chalk');

// Project modules
const commands = require('../static/commands');

const operatingSystem = process.platform;

/**
 * @description Returns how many unit test passed, failed, and which one failed
 * @returns {Array.string}
 */
module.exports = async (logs) => {
    let command = operatingSystem === "win32" ? commands.getNPMCommandsWindows : commands.getNPMCommandsUnix;
    const unitTestOutput = await exec(command.test);
    let string = unitTestOutput.stdout;


    if (logs) {
        let regex = /(?<green>√.*|.*passing.*|(?<=\s)-.*)|(?<red>(?<=\s)[0-9]+\).*|.*failing.*|(?<=\s)\+.*)/gm;
        let coloredText = string.replace(regex, `${chalk.green('$1')}${chalk.red('$2')}`);
        console.log(coloredText);
    } else {
        let regex = new RegExp("(^.*passing.*$)|(^.*failing.*$)|(^\\s*Error:.*)|(^.*Uncaught.*$)", "gm");
        let output = string.match(regex);
        let errors = "";

        if (output[1] !== undefined) {
            for (let i = 2; i < output.length; i++) {
                errors += output[i] + "\n";
            }
        }

        console.log(`${chalk.green(output[0])} \n ${output[1] !== undefined ? chalk.bgRed(chalk.black(output[1] + " =>")) : ""} \n ${errors !== undefined ? chalk.red(errors) : ""}`);
    }
};