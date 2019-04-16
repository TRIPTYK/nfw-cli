/**
 * @author Samuel Antoine
 */
const chalk = require('chalk');
const { Spinner } = require('clui');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const spawn = require ('cross-spawn');
const fs = require('fs');
const path = require('path');
const snake = require('to-snake-case')
const pluralize = require('pluralize');
const dotenv = require('dotenv');

const generator = require("../generate/generateFromDB");
const errHandler = require("./errorHandler");
const sqlAdaptor = require('../generate/database/sqlAdaptator');
const cr = require('./createRelation');
const Log = require('./log');
const modelSpecs = require('./modelSpecs');
const inquirer = require('../lib/inquirer');
const utils = require("../generate/utils");
const modelWrite = require("../generate/modelWrite");
const databaseInfo = require("../generate/databaseInfo");
const cli = require("../generate/index");
const del = require("../generate/delete");
const rmMod = require('./removeFromModel');

const WriteFile = util.promisify(fs.writeFile);
const operatingSystem = process.platform;

module.exports = {
    /**
     * @description Execute git commands such as "git init", "git clone <url>", "rmdir .git" inside the folder project
     * @param  {Object.string} command
     * @param  {Object.string} command2
     * @param  {string} name
     * @param  {string} newPath
     */
    execGit: async (command,command2, name, newPath) =>{
        const dir = newPath === undefined ?"": command.currentDirectory + newPath.path + " && ";

        Log.success('Cloning repository  ...');
        const clone = await exec(dir+command.clone);

        if(clone.stderr.length){
            Log.success('Git repository cloned successfully ....');
        }else{
            Log.error(clone.stdout);
        }

        // rename git folder command
        await exec(dir+command2.rename + name);

        let tempPath = newPath === undefined ? command.currentDirectory + name + "  && " :command.currentDirectory + path.resolve(newPath.path, name) + " && ";
        const rmGitProject = await exec(tempPath+command2.rmGit);

        if(rmGitProject.stderr.length){
            Log.error(rmGitProject.stderr);
        }else{
            Log.success('.git folder successfully deleted ...');
        }

        Log.success("Project successfully set up ....");
    },
    /**
     * @description Execute commands from a associative array send as parameter, in this case, the function execute the kickstart script from the generated project
     * @param  {Object.string} command
     * @param  {string} name
     * @param  {string} newPath
     */
    execCommand: async (command, name, newPath) =>{
        const kickstart = new Spinner('Generating app ...');
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
    spawnCommand: async (command, name, newPath) => {
      const dir = newPath === undefined ?path.resolve(process.cwd(),name):path.resolve(newPath.path, name);
      let executed = spawn(path.resolve(dir,'init_scripts', 'windowsyarn.bat'),[`${dir}`]);
        executed.stdout.on('data', (chunk) => {
            console.log(`${chunk}`)
        });
    },
    /**
     * @description Generate a small config file to indicate that the folder is a generated project"
     * @param  {Object.string} command
     * @param  {string} newPath
     * @param  {string} name
     */
    generateConfig:  async (command,newPath,name) =>{
        const dir = newPath === undefined ? command.currentDirectory + name + "  && " :command.currentDirectory + path.resolve(newPath.path, name) + " && ";
        const config = {
            name: name,
            path: newPath === undefined ? path.resolve(process.cwd(), name) : path.resolve(newPath.path, name)
        };

        await WriteFile(`${config.path}/.nfw`,JSON.stringify(config, null, 4))
          .then(() => {
            Log.success("Config file generated successfully");
          })
          .catch(e => {
            Log.error(e.message);
          });
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
                Log.error('/!\\ Process Aborted /!\\');
                process.exit(0);
            }
        }

        const spinner = new Spinner("Checking for existing entities ....");
        spinner.start();
        const isExisting = await databaseInfo.tableExistsInDB(modelName);
        spinner.stop();

        let entityModelData = null;

        if(override){
            const data = await inquirer.askForChoice(isExisting);
            switch  (data.value){
                case "create an entity":
                    entityModelData = await modelSpecs.dbParams(modelName);
                    await modelWrite.writeModel(modelName, entityModelData)
                      .catch(e => {
                        Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                        process.exit(1);
                      });
                    module.exports.migrate(modelName);
                    break;
                case "create a basic model":
                    await modelWrite.basicModel(modelName)
                      .catch(e => {
                        Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                        process.exit(1);
                      });
                    module.exports.migrate(modelName);
                    entityModelData = [];
                    entityModelData['columns'] = []
                    entityModelData['foreignKeys'] = []
                    entityModelData['createUpdate'] = {
                      createAt : true,
                      updateAt : true
                    }
                    break;
                case "nothing":
                    console.log(chalk.bgRed(chalk.black(" /!\\ Process aborted /!\\")));
                    process.exit(0);
                    break;
                case 'create from db':
                    let { columns, foreignKeys } = await databaseInfo.getTableInfo("sql", modelName);
                    for (let j = 0; j < columns.length; j++) {
                      columns[j].Type = utils.sqlTypeData(columns[j].Type);
                    }
                    entityModelData = { columns, foreignKeys };
                    await modelWrite.writeModel(modelName, entityModelData)
                      .catch(e => {
                        Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                        process.exit(1);
                      });
                    if (foreignKeys && foreignKeys.length) {
                      for (let i = 0; i < foreignKeys.length; i++) {
                        let tmpKey = foreignKeys[i];
                        let response = (await inquirer.askForeignKeyRelation(tmpKey)).response;
                        await cr.createRelation(tmpKey.TABLE_NAME, tmpKey.REFERENCED_TABLE_NAME, response, tmpKey.COLUMN_NAME, tmpKey.REFERENCED_COLUMN_NAME)
                          .then(() => Log.success("Relation successfully added !"))
                          .catch((err) => Log.error(`${err.message}\nFix the issue then run nfw ${response} ${tmpKey.TABLE_NAME} ${tmpKey.REFERENCED_TABLE_NAME}`));
                      }
                    }
                    break;
            }
        }
      await cli(modelName, crud, entityModelData )
        .catch(e => {
          console.log(e);
          Log.error(`Generation failed : ${e}\nExiting ...`);
          process.exit(1);
        });

    },
    /**
     * @description Delete a generated model from the project
     * @param  {string} modelName Model name
     * @param  {boolean} drop True or false
     */
    deleteModel:  async(modelName,drop)=>{
        modelName = snake(modelName);
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
        process.exit(0);
    },
    /**
     * @description Generate and execute the typeorm migration
     * @param {string} modelName Model name
     */
    migrate: async(modelName)=>{
        const migrate = new Spinner('Generating migration ...');
        migrate.start();

        await exec(`tsc`)
          .then(() => console.log(chalk.green("Compiled successfully")))
          .catch(e => Log.error(`Failed to compile typescript : ${e.message}`));

        await exec(`typeorm migration:generate -n ${modelName}`)
          .then(() => console.log(chalk.green("Migration generated successfully")))
          .catch(e => Log.error(`Failed to generate migration : ${e.message}`));

        await exec(`tsc`)
          .then(() => {
            Log.success("Compiled successfully");
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
    createRelation : (model1,model2,relation,name,refCol) =>{
      let migrate = true
      cr.createRelation(model1,model2,relation,name,refCol)
      .then(() => Log.success("Relation successfully added !"))
      .catch((err) => {
        migrate = false
        Log.error(err.message)}
        );
      if(migrate)module.exports.migrate(`${model1}-${model2}`);
    } ,
    rmRelation : async (model1,model2) =>{
      model1 = utils.lowercaseEntity(model1);
      model2 = utils.lowercaseEntity(model2);
      let mod1plural= null;
      let mod2plural= null;
      if (await utils.columnExist(model1,model2) ) mod2plural = false;
      if (await  utils.columnExist(model2,model1)) mod1plural = false;
      if(await utils.columnExist(model1,pluralize.plural(model2)) ) mod2plural =true;
      if(await  utils.columnExist(model2,pluralize.plural(model1)) ) mod1plural = true;
      if(mod2plural) model2 = pluralize.plural(model2);
      if(mod1plural) model1 = pluralize.plural(model1);
      if(mod1plural === null || mod2plural === null){
        Log.error('relation doesn\'t exist or exist only in one of the model\n If it exist only in one model, use editModel remove' );
        process.exit(0);
      }
      await Promise.all([rmMod.removeColumn(model1,model2),rmMod.removeColumn(model2,model1)])
      Log.success('Relation removed');
      process.exit(0);
    },
    /**
     * @description Edit tha model structure
     * @param {string} action Action (add, ...)
     * @param {string} model Model name
     * @param {string} column column name
     */
    editModel : async (action,model,column=null) => {
      if(action=='remove') await rmMod.removeColumn(model,column).then(Log.success('Column successfully removed')).catch(err => Log.error(err.message));
      if(action=='add'){
        data = await modelSpecs.newColumn();
        await modelWrite.addColumn(model,data).then(() => Log.success('Column successfully added')).catch(err => Log.error(err));
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
    editENVFiles: async() => {
      let files = fs.readdirSync('./');
      let envFiles = []
      files.forEach(element => {
        if(element.includes('.env')){
          envFiles.push(element.split('.')[0]);
        }
      });
      let {env} = await inquirer.ChoseEnvFile(envFiles);
      let chosenOne = dotenv.parse(fs.readFileSync(`${env}.env`));
      editEnvironementFile(env, chosenOne)
    },
    newEnvFile: async(name)=> {
      console.log(chalk.blue('The default choices are based on the default environement setting -> developement.env'))
      let chosenOne = dotenv.parse(fs.readFileSync(`development.env`));
      editEnvironementFile(name, chosenOne);
    }
}
async function editEnvironementFile(env, chosenOne){
  let response = await inquirer.EditEnvFile(chosenOne);
  response.NODE_ENV = env;
  response.API_VERSION = "v1";
  response.PORT = parseInt(response.PORT)
  response.JWT_EXPIRATION_MINUTES = parseInt(response.JWT_EXPIRATION_MINUTES)
  response.JIMP_SIZE_XS = parseInt(response.JIMP_SIZE_XS)
  response.JIMP_SIZE_MD = parseInt(response.JIMP_SIZE_MD)
  response.JIMP_SIZE_XL = parseInt(response.JIMP_SIZE_XL)
  if(response.HTTPS_IS_ACTIVE === false){
    response.HTTPS_IS_ACTIVE = 0;
  }else{
    response.HTTPS_IS_ACTIVE = 1;
  }
  if(response.JIMP_IS_ACTIVE === false){
    response.JIMP_IS_ACTIVE = 0;
  }else{
    response.JIMP_IS_ACTIVE = 1;
  }
  let envString = JSON.stringify(response, null, '\n');
  let reg = /\"(.*)\":\s*(\".*\"|\d+)/gm;
  let output = envString.replace(reg,`$1 = $2`).replace('{',"").replace('}','').replace(/(,)(?!.*,)/gm,"")
  fs.writeFileSync(`${env}.env`, output);
}
