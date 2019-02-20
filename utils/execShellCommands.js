const chalk = require('chalk');
const CLUI         = require('clui');
const Spinner     = CLUI.Spinner;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const status = new Spinner('Cloning files, please wait ...');
const kickstart = new Spinner('Generating app ...');
const operatingSystem = process.platform;
module.exports = {
    execGit: async (command,command2, name, newPath) =>{
        status.start();
        const dir = newPath === undefined ?"": command.currentDirectory + newPath.path + " && ";
        const clone = await exec(dir+command.clone);
        if(clone.stdout.length){
            console.log(chalk.red('Error') + " : " + clone.stdout);
        }else{
            console.log(chalk.green('Git repository cloned successfully ....'));
        }
        const rename = await exec(dir+command2.rename + name);
        let tempPath= newPath === undefined ?command.currentDirectory + name + "  && " :(operatingSystem === "win32"? command.currentDirectory + newPath.path+"\\"+ name + " && " : command.currentDirectory + newPath.path+"/"+name + " && "); 
        const rmGitProject = await exec(tempPath+command2.rmGit);
        if(rmGitProject.stderr.length){
            console.log(chalk.red('Error') + " : " + rmGitProject.stderr);
        }else{
            console.log(chalk.green('.git folder successfully deleted ...'));
        }
        console.log(chalk.green("Project successfully set up ...."));
        status.stop();
    },
    execCommand: async (command, name, newPath) =>{
        kickstart.start();
        const dir = newPath === undefined ?command.currentDirectory + name + "  && " :(operatingSystem === "win32"? command.currentDirectory + newPath.path+"\\"+ name + " && " : command.currentDirectory + newPath.path+"/"+name + " && "); 
        const { stdout, stderr } = await exec(dir+command.kickstart);  
        console.log(chalk.green("Generated successfully, Compiling TypeScript "));
        const tsc = await exec(dir+command.compileTypeScript);  
        console.log(chalk.green("Compiled successfully, executing unit test "));
        const unitTestOutput = await exec(dir+command.test);  
        var string = unitTestOutput.stdout;
        var regex = new RegExp("(^.*passing.*$)|(^.*failing.*$)|(^\\s*Error:.*)","gm");
        var output = string.match(regex);
        console.log(output);
        kickstart.stop();
    }
}