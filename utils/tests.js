const path = require('path');
module.exports = {
    execUnitTests: async() =>{
        const commands = require('./commands')
        let command = operatingSystem === "win32" ? commands.getNPMCommandsWindows : commands.getNPMCommandsUnix;
        const unitTestOutput = await exec(dir+command.test);  
        var string = unitTestOutput.stdout;
        var regex = new RegExp("(^.*passing.*$)|(^.*failing.*$)|(^\\s*Error:.*)","gm");
        var output = string.match(regex);
        console.log(output);
    }
}