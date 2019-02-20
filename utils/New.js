const inquirer = require('../lib/inquirer');
const commands = require("./commands");
const draw = require('./draw');
const shellCmd = require('./execShellCommands');
const operatingSystem = process.platform;
var newPath = undefined;
module.exports = {
    New: async () => {
        draw.header();
        const answer = await inquirer.askPathValidation();
        if(answer.pathCorrect === "no"){
            newPath = await inquirer.askForNewPath();
        }
        const projectName = await inquirer.askForProjectName();
        const rmCommand = operatingSystem === 'win32' ? commands.rmGitWin : commands.rmGitUnix; 
        await shellCmd.execGit(commands.getGitCommands,rmCommand,projectName.name, newPath);
        const kickstartCommand = operatingSystem === 'win32' ? commands.getNPMCommandsWindows : commands.getNPMCommandsUnix;
        shellCmd.execCommand(kickstartCommand,projectName.name, newPath);
    }
}