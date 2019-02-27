/**
 * @author Samuel Antoine
 */
const inquirer = require('../lib/inquirer');
const commands = require("./commands");
const draw = require('./draw');
const shellCmd = require('./execShellCommands');
const chalk = require('chalk');
const operatingSystem = process.platform;
const path = require('path');
var newPath = undefined;
module.exports = {
    /**
        @description Generate a new project
        @generator
     */
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
        await shellCmd.execCommand(kickstartCommand,projectName.name, newPath);
        await shellCmd.generateConfig(commands.getGitCommands, newPath, projectName.name);
        if(process.cwd() !== newPath && newPath !== undefined){
            console.log(chalk.bgYellow("\n" + chalk.black('/!\\ Warning /!\\')) + chalk.yellow(" If you want to perform any other tpf commands please go to the generated folder -> ")+ chalk.blue(path.resolve(newPath.path, projectName.name)));
        }

    }
}