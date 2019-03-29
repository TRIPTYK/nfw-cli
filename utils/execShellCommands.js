/**
 * @author Samuel Antoine
 */
const chalk = require('chalk');
const CLUI         = require('clui');
const Spinner     = CLUI.Spinner;
const util = require('util');
const exec = util.promisify(require('child_process').exec);
let { spawn } = require('child_process');
spawn = require ('cross-spawn');
const fs = require('fs');
const read = util.promisify(fs.readFile);
const status = new Spinner('Cloning files, please wait ...');
const kickstart = new Spinner('Generating app ...');
const migrate = new Spinner('Generating migration ...');
const path = require('path');
const Log = require('./log');
const modelSpecs = require('./modelSpecs');
const inquirer = require('../lib/inquirer');
const utils = require("../generate/utils");
const modelWrite = require("../generate/modelWrite");
const databaseInfo = require("../generate/databaseInfo");
const cli = require("../generate/index");
const del = require("../generate/delete");
const generator = require("../generate/generateFromDB");
const errHandler = require("./ErrorHandler");
const snake = require('to-snake-case')
const operatingSystem = process.platform;
const sqlAdaptor = require('../generate/database/sqlAdaptator')


module.exports = {
    /**
     * @description Execute git commands such as "git init", "git clone <url>", "rmdir .git" inside the folder project
     * @param  {Object.string} command
     * @param  {Object.string} command2
     * @param  {string} name
     * @param  {string} newPath
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
        await exec(dir+command2.rename + name);
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
     * @description Execute commands from a associative array send as parameter, in this case, the function execute the kickstart script from the generated project
     * @param  {Object.string} command
     * @param  {string} name
     * @param  {string} newPath
     */
    execCommand: async (command, name, newPath) =>{
        kickstart.start();
        const dir = newPath === undefined ?command.currentDirectory + name + "  && " :command.currentDirectory + path.resolve(newPath.path, name)+ " && ";

        await exec(dir+command.kickstart)
          .catch(e => Log.error(`Failed to generate project : ${e.message}`))
          .then(() => console.log(chalk.green("Generated successfully, Compiling TypeScript ")));

        await exec(dir+command.compileTypeScript)
          .catch(e => Log.error(`Failed to compile typescript : ${e.message}`))
          .then(() => console.log(chalk.green("Compiled successfully")));

        kickstart.stop();
    },
    /**
     * @description Generate a small config file to indicate that the folder is a generated project"
     * @param  {Object.string} command
     * @param  {string} newPath
     * @param  {string} name
     */
    generateConfig:  async (command,newPath,name) =>{
        const dir = newPath === undefined ? command.currentDirectory + name + "  && " :command.currentDirectory + path.resolve(newPath.path, name)+ " && ";
        const config = {
            name: name,
            path: newPath === undefined ? path.resolve(process.cwd(), name) :path.resolve(newPath.path, name)
        }
        const genCfg = await exec(dir+ `echo ${JSON.stringify(config)} >> .nfw`);
        console.log(chalk.green("Config file generated successfully"));
    },
    /**
     * @description Generate a new model. First check if the model exists in the files, if he exists ask if you wan to override it.   if it doesn't exists check if he exists in the database. if he exists in the database but not in the files it will generate it based on the database. If he exists in the file and we want to ovveride it, or he simply doesn't exists it will ask you a bunch of question to generate it as you wish
     * @param  {string} modelName
     * @param  {string} crud
     */
    generateModel: async(modelName, crud) => {
        let doMigration = true;
        modelName = snake(modelName);
        const modelExists = await utils.modelFileExists(modelName);
        let override = true;
        if(modelExists){
            const question = await inquirer.askForConfirmation(`${chalk.magenta(modelName)} already exists, will you overwrite it ?` );
            if(!question.confirmation){
                console.log(chalk.bgRed(chalk.black('/!\\ Process Aborted /!\\')));
                process.exit(0);
            }
        }
        var spinner = new Spinner("Checking for existing entities ....");
        spinner.start();
        const isExisting = await databaseInfo.tableExistsInDB(modelName);
        spinner.stop();

        let entityModelData = null;

        if(!isExisting || (override && modelExists)){
            const data = await inquirer.askForChoice();
            switch  (data.value){
                case "create an entity":
                    let { columns , foreignKeys } = await modelSpecs.dbParams(modelName);
                    entityModelData = { columns , foreignKeys };
                    await modelWrite.main("write", modelName, entityModelData)
                      .catch(e => {
                        Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                        process.exit(1);
                      });
                    break;
                case "create a basic model":
                    await modelWrite.main("basic", modelName)
                      .catch(e => {
                        Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                        process.exit(1);
                      });
                    break;
                case "nothing":
                    console.log(chalk.bgRed(chalk.black(" /!\\ Process aborted /!\\")));
                    process.exit(0);
                    break;
            }
        }else{
          doMigration = false;
          let { columns , foreignKeys } = await databaseInfo.getTableInfo("sql",modelName);
          for(let j =0;j<columns.length;j++){
            columns[j].Type= utils.sqlTypeData(columns[j].Type);
          }
          if (foreignKeys && foreignKeys.length) {
              for (let i=0;i < foreignKeys.length;i++) {
                let tmpKey = foreignKeys[i];
                let response = (await inquirer.askForeignKeyRelation(tmpKey)).response;
                foreignKeys[i].type = response;
              }
           }

         entityModelData = { columns , foreignKeys };
         await modelWrite.main('write', modelName , entityModelData)
           .catch(e => {
             Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
             process.exit(1);
           });
       }
      await cli(modelName, crud, entityModelData )
        .catch(e => {
          console.log(e);
          Log.error(`Generation failed : ${e}\nExiting ...`);
          process.exit(1);
        });

      if(doMigration) module.exports.migrate(modelName);
      else process.exit(0);
    },
    /**
     * @description Delete a generated model from the project
     * @param  {string} modelName Model name
     * @param  {boolean} drop True or false
     */
    deleteModel:  async(modelName,drop)=>{
        await del(modelName,drop);
        process.exit(0);
    },
    /**
     * @description Call the core function to generate a model from the database     */
    generateFromDB: async() => {
        var confirm = await inquirer.askForConfirmation(`${chalk.bgYellow(chalk.black('Warning :'))} generate model from the database will override existing models with the same name ! Do you want to continue ?`);
        if(confirm.confirmation){
            await generator();
        }else{
            console.log(chalk.bgRed(chalk.black('/!\\ Process Aborted /!\\')));
            process.exit(0);
        }
    },
    /**
     * @description Starts the server in the shell and display every output
     * @param {string} environement Environement 
     */
    startServer: async(environement) => {
        let executed = spawn(`node`,[`${path.resolve('dist', 'app.bootstrap.js')}`,"--env",environement]);
        executed.stdout.on('data', (chunk) => {
            console.log(`${chunk}`)
        });
        executed.on('close', (code) => {
          console.log(chalk.red(`Process exited with code ${code}`));
        });
    },
    /**
     * @description Generate and execute the typeorm migration
     * @param {string} modelName Model name
     */
    migrate: async(modelName)=>{
        migrate.start();

        await exec(`tsc`)
          .then(() => console.log(chalk.green("Compiled successfully")))
          .catch(e => Log.error(`Failed to compile typescript : ${e.message}`));

        await exec(`typeorm migration:generate -n ${modelName}`)
          .then(() => console.log(chalk.green("Migration generated successfully")))
          .catch(e => Log.error(`Failed to generate migration : ${e.message}`));

        await exec(`tsc`)
          .then(() => {
            console.log(chalk.green("Compiled successfully"))
            operatingSystem === 'win32' ? exec('rmdir /Q /S src\\migration\\').catch(err => errHandler.deleteMigrateErr(err)): exec('rm -rf ./src/migration').catch(err => errHandler.deleteMigrateErr(err));
          })
          .catch(e => Log.error(`Failed to compile typescript : ${e.message}`));

        await exec(`typeorm migration:run`)
          .then(() => console.log(chalk.green("Migration executed successfully")))
          .catch(async e => {
            Log.error(`Failed to execute migration : ${e.message}`);
            await errHandler.migrateRunFail();

          });
        migrate.stop();
        process.exit(0);
    },

    /**
     * @description Create a dockerfile
     * @param {string} newPath Path
     * @param {string} data Data about the dockerfile
     * @param {string} dockerImageName Docker image name
     * @param {string} port Docker port
     */
    createDockerImage: async(newPath, data, dockerImageName, port) => {
      fs.writeFileSync(path.resolve(newPath, "dockerfile"),data);
      const dockerBuild = await exec(`docker build ${newPath} -t ${dockerImageName.toLowerCase()}`);
      try{
        const dockerRun = await exec(`docker run -p ${port}:${port} -d --name=${dockerImageName} ${dockerImageName}`);
        console.log(`Container launched and named: ${dockerImageName}`);
      }catch(err){
        console.log(err);
        console.log(`Can't start the container run the command below to see the details \n docker run -p ${port}:${port} -d --name=${dockerImageName} ${dockerImageName.toLowerCase()}`)
      }
    },
     /**
      * @description Create a relationship between two models
      * @param {string} model1 First model name
      * @param {string} model2 Second model name
      */
    createRelation : async(model1,model2,relation) =>{
      let migrate = true;
      await modelWrite.addRelation(model1,model2,true,relation)
      .catch(err => {
        Log.error(err.message)
        migrate = false;
      });
      if(migrate)await modelWrite.addRelation(model2,model1,false,relation)
      .then(() => Log.success(`reliatonship between ${model1} and  ${model2} added in models`))
      .catch(err => {
        Log.error(err.message)
        migrate = false;
      });
      if(migrate)module.exports.migrate(`${model1}-${model2}`);       
    } ,
    /**
     * @description Edit tha model structure
     * @param {string} action Action (add, ...)
     * @param {string} model Model name
     * @param {string} column column name
     */
    editModel : async (action,model,column=null) => { 
      if(action=='remove') await modelWrite.removeColumn(model,column).then(Log.success('Column successfully removed')).then(() => Log.success('Column successfully added')).catch(err => Log.error(err.message));
      if(action=='add'){
        data = await modelSpecs.newColumn();
        await modelWrite.addColumn(model,data).catch(err => Log.error(err.message));
      }
      process.exit(0);
    },
    /**
     * @description Copile TypeScript into javascript
     */
    compileTypeScript : async() =>{
      await exec(`tsc`)
          .then(() => console.log(chalk.green("Compiled successfully")))
          .catch(e => {
            Log.error(`Failed to compile typescript : ${e.message}`);
            process.exit(0);
          });
    },
    /**
     * @description Create a Super User
     * @param {string} username Super user username
     */
    createSuperUser: async(username) => {
      let credentials = await sqlAdaptor.insertAdmin(username);
      fs.writeFileSync('credentials.json', `{\n\"login\": \"${credentials.login}\" ,\n \"password\": \"${credentials.password}\"\n}`);
      console.log(chalk.bgYellow(chalk.black('/!\\ WARNING /!\\ :'))+ "You have generated a Super User for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsability to change this password to your own password");
      process.exit(0);
    }

}