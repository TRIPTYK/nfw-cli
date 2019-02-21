const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const operatingSystem = process.platform;
module.exports = {
    /**
     * @description Execute unit tests
     */
    execUnitTests: async() =>{
        const commands = require('./commands')
        let command = operatingSystem === "win32" ? commands.getNPMCommandsWindows : commands.getNPMCommandsUnix;
        const unitTestOutput = await exec(command.test);  
        var string = unitTestOutput.stdout;
        /**
         * @description Returns how many unit test passed, failed, and which one failed
         * @returns {Array.<string>}
         */
        var regex = new RegExp("(^.*passing.*$)|(^.*failing.*$)|(^\\s*Error:.*)","gm");
        var output = string.match(regex);
        console.log(output);
    }
}