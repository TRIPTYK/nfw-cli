/**
 * @author Samuel Antoine , Amaury Delforenne
 * @module test
 * @exports execUnitTests
 */
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const operatingSystem = process.platform;
const chalk = require('chalk');
const CLUI = require('clui');
const Spinner = CLUI.Spinner;
const status = new Spinner('Executing unit tests, please wait ...');

module.exports = {
    /**
     * @description Execute unit tests
     * @param {boolean} logs May show full logs output at the end of the unit tests
     */
    execUnitTests: async(logs) =>{
        status.start();
        const commands = require('./commands')
        let command = operatingSystem === "win32" ? commands.getNPMCommandsWindows : commands.getNPMCommandsUnix;
        const unitTestOutput = await exec(command.test);
        let string = unitTestOutput.stdout;

        /**
         * @description Returns how many unit test passed, failed, and which one failed
         * @returns {Array.string}
         */
        if(logs){
          let regex = /(?<green>√.*|.*passing.*|(?<=\s)\-.*)|(?<red>(?<=\s)[0-9]+\).*|.*failing.*|(?<=\s)\+.*)/gm;
          let coloredText = string.replace(regex,`${chalk.green('$1')}${chalk.red('$2')}`);
          status.stop();
          console.log(coloredText);
        }else{
          let regex = new RegExp("(^.*passing.*$)|(^.*failing.*$)|(^\\s*Error:.*)|(^.*Uncaught.*$)","gm");
          let output = string.match(regex);
          let errors = "";

          if(output[1] !== undefined) {
              for(let i = 2;i<output.length;i++){
                  errors += output[i] + "\n";
              }
          }

          status.stop();
          console.log(`${chalk.green(output[0])} \n ${output[1] !== undefined ? chalk.bgRed(chalk.black(output[1]+" =>")) : ""} \n ${errors !== undefined ? chalk.red(errors) : ""}`);
          process.exit(0);
        }
    }
}
