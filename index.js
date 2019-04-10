#!/usr/bin/env node
/**
 * @author Samuel Antoine
 */
const clear = require('clear');
const project = require('./utils/New');
const files = require('./lib/files');
const yargs = require('yargs');
const chalk = require('chalk');
const path = require('path');
const commands = require('./utils/execShellCommands');
const test = require('./utils/tests');
const inquirer = require('./lib/inquirer');
const sql = require('./generate/database/sqlAdaptator');
const reserved = require('reserved-words');
const Log = require('./generate/log')
const utils = require('./generate/utils');
const validateDirectory = ()=>{
  if(!files.isProjectDirectory()){
    console.log(chalk.bgRed(chalk.black('ERROR ! : You are not in a project directory')));
    process.exit(0);
  }
}
yargs
.strict()
  .command({
    command: 'new',
    aliases: ['n'],
    desc: 'Generate a new project',
    builder: (yargs) => {
      yargs.option('env',{
        desc: "Allow user to specify ENV variables",
        type: "boolean"
      }),
      yargs.option('path',{
        desc: "Allow the user to choose a different path",
        type: 'boolean'
      }),
      yargs.option('docker',{
        desc: "Set a mysql container up",
        type: 'boolean'
      }),
      yargs.option('yarn',{
        desc: "Set yarn as package manager",
        type: 'boolean'
      })
    },
    handler: async(argv) => {
      clear();
      if(argv._[1] === undefined){
        console.log(chalk.red('Please provide a name for your application'));
        process.exit(0);
      }
      project.New(argv._[1],argv.env !== undefined ? true: false, argv.path != undefined ? true: false,argv.docker != undefined ? true: false, argv.yarn != undefined ? true: false  );
    }
  }).command({
    strict: true,
    command: 'test',
    aliases: ['t'],
    desc: 'Execute unit tests',
    builder: (yargs) => {
      yargs.option('logs', {
        desc: "Show the full output",
        type: 'boolean'
      })
    },
    handler: async (argv) => {
      validateDirectory();
      await sql.checkConnexion();
      test.execUnitTests(argv.logs !== undefined ? true : false);
    }
  })
  .command({
    command: 'generate <modelName> [CRUD]',
    aliases: ['gen', 'g'],
    desc: 'Generate a new model',
    builder: (yargs) => {
      yargs.default('CRUD', 'CRUD');
    },
    handler: async (argv) => {
      validateDirectory();
      await sql.checkConnexion();
      if (await reserved.check(argv.modelName,6)){
        console.log("modelName is a reserved word");
        process.exit(0);
      }
      commands.generateModel(argv.modelName,argv.CRUD);
    }
  })
  .command({
    command: 'import',
    aliases: ["imp"],
    desc: "Generate all the files from existing tables in the databse",
    builder: () => {},
    handler: async () => {
      validateDirectory();
      check = await sql.checkConnexion();
      commands.generateFromDB();
    }
  })
  .command({
    command: 'delete <modelName>',
    aliases: ['del', 'D'],
    drop: false,
    desc: 'Generate a new model',
    builder: (yargs) => {
      yargs.option({
        DROP :{
          default:false,
          type: 'boolean'
        }
      })
    },
    handler: async (argv) => {
      validateDirectory();
      if(argv.DROP)await sql.checkConnexion();
      commands.deleteModel(argv.modelName,argv.DROP);
    }
  })
  .command({
    command: 'info',
    aliases: ['i'],
    desc: 'Show the information about the developers',
    builder: () => {},
    handler: () => {
      console.log(chalk.bgGreen('Made by :')+ "\n Amaury Deflorenne <https://github.com/AmauryD> \n Romain Verliefden <https://github.com/DramixDW> \n Samuel Antoine <https://github.com/Snorkell> \n Steve Lebleu <https://github.com/konfer-be>");
      process.exit(0);
    }
  })
  .command({
    command:"start",
    aliases : [],
    desc: "Start the api server",
    builder: (yargs) =>{
      yargs.option('env',{
        desc: "Specify the environement type",
        type: "string"
      }),
      yargs.option('monitoring',{
        desc: "Launch monitoring websockets server",
        type: "boolean"
      })
    },
    handler: async(argv) => {
      validateDirectory();
      let environement = argv.env !== undefined ? argv.env : "development";
      let monitoring = argv.monitoring !== undefined ? argv.monitoring : false;
      if(environement.toLowerCase() === ('development') || environement.toLowerCase() === ('staging') || environement.toLowerCase() === ('test') ||environement.toLowerCase() === ('production')){
        console.log(chalk.bgYellow(chalk.black('To quit the process press CTRL+C and validate')));
        await commands.compileTypeScript();
        commands.startServer(environement, monitoring);
      }else{
        console.log(chalk.red(`${environement} is not a valid environement`))
        process.exit(0);
      }
    }
  })
  .command({
    command:'migrate  <migrateName>',
    aliases: ["mig", "M"],
    desc: "Generate, compile and run the migration",
    builder: () => {},
    handler: async (argv) => {
      validateDirectory();
      await sql.checkConnexion();
      if (await reserved.check(argv.modelName,6)){
        console.log("modelName is a reserved word");
        process.exit(0);
      }
      commands.migrate(argv.migrateName);
    }
  })
  .command({
    command:'createSU <username>',
    aliases: ['csu'],
    desc: "Create a Super User and save the credentials in a file",
    builder: () => {},
    handler: async(argv) => {
      validateDirectory();
      await sql.checkConnexion();
      commands.createSuperUser(argv.username);
    }
  })
  .command({
    command:'addRelationship <relation> <model1> <model2>',
    aliases:['ar','addR'],
    desc: 'Create  relation between two table',
    builder : (yargs) => {
      yargs.option('name',{
        desc: "Specify the name of foreign key (for Oto) or the name of the bridging table (for Mtm)",
        type: "string",
        default: null
      })
      .option('refCol',{
        desc: "Specify referenced column for a oto relation",
        type: "string",
        default: null
      })
    },
    handler : (argv) =>{
     commands.createRelation(argv.model1,argv.model2,argv.relation,argv.name,argv.refCol);
    }
  })
  .command({
    command:'removeRelatoin <model1> <model2>',
    aliases:['rr','rmRl'],
    desc: 'Create  relation between two table',
    builder : () => {},
    handler : (argv) =>{
     commands.rmRelation(argv.model1,argv.model2);
    }
  })
  .command({
    command:'editModel <model> <action> [column]',
    aliases: ["em", "edit"],
    desc: 'add or remove column in a model',
    builder : (yargs) => {},
    handler : (argv) =>{
      if(!utils.modelFileExists(argv.model)){
        Log.error("Model should exist in order to edit him :)");
        process.exit(0);
      } 
      if (argv.action ==='add')commands.editModel('add',argv.model);
      else if (argv.action === 'remove' && argv.column != undefined )commands.editModel('remove',argv.model,argv.column);
      else if (argv.action === 'remove' && argv.column == undefined ) Log.info("you must specify the column to remove");
      else Log.info("action must be add or remove");
    }
  })
  // provide a minimum demand and a minimum demand message
  .demandCommand(1, 'You need at least one command before moving on')
  .help().scriptName('nfw')
  .argv;
