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
      })
    },
    handler: async(argv) => {
      clear();
      project.New(argv.env !== undefined ? true: false);
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
      check = await sql.checkConnexion();
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
      check = await sql.checkConnexion();
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
    handler: () => {
      validateDirectory();
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
      check = await sql.checkConnexion();
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
      })
    },
    handler: (argv) => {
      validateDirectory();
      let environement = argv.env !== undefined ? argv.env : "development";
      if(environement.toLowerCase() === ('development') || environement.toLowerCase() === ('staging') || environement.toLowerCase() === ('test') ||environement.toLowerCase() === ('production')){
        console.log(chalk.bgYellow(chalk.black('To quit the process press CTRL+C and validate')));
        commands.startServer(environement);
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
    command:'genFile <path>',
    desc : 'generate an entity from a file ',
    builder: () => {},
    handler:(argv) =>{
      commands.generateFromFile(argv.path);
    } 
  })
  // provide a minimum demand and a minimum demand message
  .demandCommand(1, 'You need at least one command before moving on')
  .help().scriptName('nfw')
  .argv;
