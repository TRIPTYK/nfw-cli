const chalk = require('chalk');
const CLUI         = require('clui');
const Spinner     = CLUI.Spinner;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');
const read = util.promisify(fs.readFile);
const status = new Spinner('Cloning files, please wait ...');
const kickstart = new Spinner('Generating app ...');
const migrate = new Spinner('Generating migration ...');
const path = require('path');
const modelSpecs = require('./modelSpecs');
const inquirer = require('../lib/inquirer');
module.exports = {
    /**
     * @description Execute git commands such as "git init", "git clone <url>", "rmdir .git" inside the folder project
     * @param  {Object.<string>} command
     * @param  {Object.<string>} command2
     * @param  {<string>} name
     * @param  {<string>} newPath
     */
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
        let tempPath= newPath === undefined ?command.currentDirectory + name + "  && " :command.currentDirectory + path.resolve(newPath.path, name)+ " && "; 
        const rmGitProject = await exec(tempPath+command2.rmGit);
        if(rmGitProject.stderr.length){
            console.log(chalk.red('Error') + " : " + rmGitProject.stderr);
        }else{
            console.log(chalk.green('.git folder successfully deleted ...'));
        }
        console.log(chalk.green("Project successfully set up ...."));
        status.stop();
    },
    /**
     * @description Execute commands from a associative array send as parameter, in this case, hte function execute the kickstart script from the generated project
     * @param  {Object.<string>} command
     * @param  {<string>} name
     * @param  {<string>} newPath
     */
    execCommand: async (command, name, newPath) =>{
        kickstart.start();
        const dir = newPath === undefined ?command.currentDirectory + name + "  && " :command.currentDirectory + path.resolve(newPath.path, name)+ " && "; 
        const { stdout, stderr } = await exec(dir+command.kickstart);  
        console.log(chalk.green("Generated successfully, Compiling TypeScript "));
        const tsc = await exec(dir+command.compileTypeScript);  
        console.log(chalk.green("Compiled successfully"));
        kickstart.stop();
    },
    /**
     * @description Generate a small config file to indicate that the folder is a generated project"
     * @param  {Object.<string>} command
     * @param  {<string>} newPath
     * @param  {<string>} name
     */
    generateConfig:  async (command,newPath,name) =>{
        const dir = newPath === undefined ? command.currentDirectory + name + "  && " :command.currentDirectory + path.resolve(newPath.path, name)+ " && "; 
        const config = {
            name: name,
            path: newPath === undefined ? path.resolve(process.cwd(), name) :path.resolve(newPath.path, name)
        }
        const genCfg = await exec(dir+ `echo ${JSON.stringify(config)} >> cfg.tpf`);
        console.log(chalk.green("Config file generated successfully"));
    },
    /**
     * @description Generate a new model in the project
     * @param  {<string>} modelName
     * @param  {<string>} crud
     */
    generateModel: async(modelName, crud) => {
        var spinner = new Spinner("Checking for existing entities ....");
        spinner.start();
        const modelWrite = require(path.resolve(process.cwd()+"/cli/generate/modelWrite"));
        const isExisting = await modelWrite("check", modelName);
        spinner.stop();
        if(!isExisting){
            const data = await inquirer.askForChoice();
            switch(data.value){
                case "create an entity":
                    const entity = await modelSpecs.dbParams(modelName);
                    await modelWrite("write", modelName, entity);
                    break;
                case "create a basic model":
                    await modelWrite("basic", modelName);
                    break;
                case "nothing":
                    console.log(chalk.bgRed(chalk.black(" /!\\ Process aborted /!\\")));
                    process.exit(0);
                    break;
            }
        }else await modelWrite('db', modelName);
        
        const cli = require(path.resolve(process.cwd()+"/cli/generate/index"));
        await cli(modelName, crud);
        migrate.start();
        var {stdout, stderr} = await exec(`tsc`);
        console.log(chalk.green('Typescript compiled successfully ... '));
        var {stdout, stderr} = await exec(`typeorm migration:generate -n ${modelName}`);
        console.log(chalk.green('Migration generated successfully ...'));
        var {stdout, stderr} = await exec(`tsc`);
        console.log(chalk.green('Typescript compiled successfully ... '));
        var {stdout, stderr} = await exec(`typeorm migration:run`);
        console.log(chalk.green('Migration executed successfully ...'))
        migrate.stop();
        process.exit(0);
    },
    /**
     * @description Delete a generated model from the project
     * @param  {<string>} modelName
     */
    deleteModel:  async(modelName)=>{
        const del = require(path.resolve(process.cwd()+"/cli/generate/delete"));
        await del(modelName);
    }
}