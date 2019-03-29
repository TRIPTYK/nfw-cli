/**
 * @author Samuel Antoine
 * @module New
 * @exports New
 */
const draw = require('./draw');
const inquirer = require('../lib/inquirer');
const commands = require("./commands");
const shellCmd = require('./execShellCommands');
const chalk = require('chalk');
const operatingSystem = process.platform;
const path = require('path');
const fs = require('fs');
const cmd_e = require('command-exists').sync;
const files = require('../lib/files');
var newPath = undefined;
let dockerFile = undefined;
let Container_name = undefined;
let dockerEnv = undefined;
module.exports = {
    /**
     *  @description Generate a new project
     *   @param {string} name Project name
     *   @param {boolean} env Ask for env variables
     *   @param {boolean} pathOption Ask for path
     *   @param {boolean} docker Ask for docker env variables
     *   @param {boolean} yarn Install dependencies with yarn
     */
    New: async (name,env,pathOption, docker, yarn) => {
        draw.header();
        if(pathOption){
            newPath = await inquirer.askForNewPath();
        }
        if(files.directoryExists(path.resolve(newPath === undefined ? process.cwd(): newPath.path, "3rd_party_ts_boilerplate")) || files.directoryExists(path.resolve(newPath === undefined ? process.cwd() : newPath.path, name))){
            console.log(chalk.red('Error :') + `You already have a directory name \"3rd_party_ts_boilerplate\" or "${name}" !`);
            process.exit(0);
        }
        if(docker){
            if(!cmd_e('docker')){
                console.log(chalk.red('Error: docker is not installed on your device !'));
                process.exit(0);
            }
            else{
                env = true;
                dockerEnv = await inquirer.askForDockerVars();
                Container_name = dockerEnv.Container_name;
                dockerFile = "FROM mysql:5.7 \n"+
                "SHELL [\"/bin/bash\", \"-c\"] \n"+
                `ENV MYSQL_ROOT_PASSWORD ${dockerEnv.MYSQL_ROOT_PASSWORD} \n`+
                `ENV MYSQL_DATABASE ${dockerEnv.MYSQL_DATABASE} \n`+
                `EXPOSE ${dockerEnv.EXPOSE}`;
            }
        }
        let envVar = undefined;
        if(env){
            envVar = await inquirer.askForEnvVariable();
            envVar.URL = `http://localhost:${envVar.PORT}`;
        }
        const rmCommand = operatingSystem === 'win32' ? commands.rmGitWin : commands.rmGitUnix; 
        await shellCmd.execGit(commands.getGitCommands,rmCommand,name, newPath);
        const kickstartCommand = operatingSystem === 'win32' ? commands.getNPMCommandsWindows : commands.getNPMCommandsUnix;
        await shellCmd.execCommand(kickstartCommand,name, newPath);
        await shellCmd.generateConfig(commands.getGitCommands, newPath, name);
        if(process.cwd() !== newPath && newPath !== undefined){
            console.log(chalk.bgYellow("\n" + chalk.black('/!\\ Warning /!\\')) + chalk.yellow(" If you want to perform any other nfw commands please go to the generated folder -> ")+ chalk.blue(path.resolve(newPath.path, name)));
        }
        if(env){
            const envFilePath = newPath === undefined ? path.resolve(process.cwd(), name + `/${envVar.env.toLowerCase()}.env`) : path.resolve(newPath.path, name + `/${envVar.env.toLowerCase()}.env`);
            let envFileContent =await fs.readFileSync(envFilePath).toString();
            const variables = Object.entries(envVar);
            for(const [k,v] of variables){
                let reg = new RegExp(`^(?<key>${k})\\s*=\\s*(?<value>.+)$`, "gm");
                envFileContent = envFileContent.replace(reg,"$1= " + "'" +v + "'");
            }
            fs.writeFileSync(envFilePath, envFileContent)
        }
        if(docker){
            const projectPath = newPath === undefined ? path.resolve(process.cwd(),name, "Docker") : path.resolve(newPath.path, name, "Docker");
            files.creatDirectory(projectPath);
            await shellCmd.createDockerImage(projectPath,dockerFile,Container_name, dockerEnv.EXPOSE)
        }
    },
}