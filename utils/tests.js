const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const operatingSystem = process.platform;
const chalk = require('chalk');
const CLUI         = require('clui');
const Spinner     = CLUI.Spinner;
const status = new Spinner('Executing unit tests, please wait ...');
module.exports = {
    /**
     * @description Execute unit tests
     */
    execUnitTests: async(logs) =>{
        status.start();
        const commands = require('./commands')
        let command = operatingSystem === "win32" ? commands.getNPMCommandsWindows : commands.getNPMCommandsUnix;
        const unitTestOutput = await exec(command.test);  
        var string = unitTestOutput.stdout;
        if(logs){
            var regex = new RegExp('(√.*|.*passing.*|(?<=\\s)\\-.*)|((?<=\\s)[0-9]+\\).*|.*failing.*|(?<=\\s)\\+.*)',"gm").exec(string);
            var output = string.match(regex);
            status.stop();
            console.log(regex);
        }else{
            /**
         * @description Returns how many unit test passed, failed, and which one failed
         * @returns {Array.<string>}
         */
        var regex = new RegExp("(^.*passing.*$)|(^.*failing.*$)|(^\\s*Error:.*)|(^.*Uncaught.*$)","gm");
        var output = string.match(regex);
        let errors = "";
        if(output[1] !== undefined){
            for(let i = 2;i<output.length;i++){
                errors += output[i] + "\n";   
            }
        }
        status.stop();
        console.log(`${chalk.green(output[0])} \n ${output[1] !== undefined ? chalk.bgRed(chalk.black(output[1]+" =>")) : ""} \n ${errors !== undefined ? chalk.red(errors) : ""}`);
        }
    }
}