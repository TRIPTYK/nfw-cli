/**
 * @author Samuel Antoine
 */
const draw = require('./draw');
const inquirer = require('../lib/inquirer');
const commands = require("./commands");
const shellCmd = require('./execShellCommands');
const chalk = require('chalk');
const operatingSystem = process.platform;
const path = require('path');
const fs = require('fs');
var newPath = undefined;
module.exports = {
    /**
        @description Generate a new project
        @generator
     */
    New: async (env) => {
        draw.header();
        let envVar = undefined;
        if(env){
            envVar = await inquirer.askForEnvVariable();
            envVar.URL = `http://localhost:${envVar.PORT}`;
        }
        const answer = await inquirer.askPathValidation();
        if(!answer.pathCorrect){
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
        if(env){
            const envFilePath = newPath === undefined ? path.resolve(process.cwd(), projectName.name + `/${envVar.env.toLowerCase()}.env`) : path.resolve(newPath.path, projectName.name + `/${envVar.env.toLowerCase()}.env`);
            let envFileContent =await fs.readFileSync(envFilePath).toString();
            const variables = Object.entries(envVar);
            for(const [k,v] of variables){
                let reg = new RegExp(`^(?<key>${k})\\s*=\\s*(?<value>.+)$`, "gm");
                envFileContent = envFileContent.replace(reg,"$1= " + "'" +v + "'");
            }
            fs.writeFileSync(envFilePath, envFileContent)
        }
    },
}