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
const validateDirectory = ()=>{
  if(!files.isProjectDirectory()){
    console.log(chalk.bgRed(chalk.black('ERROR ! : You are not in a project directory')));
    process.exit(0);
  }
}
yargs
  .command({
    command: 'new',
    aliases: ['n'],
    desc: 'Generate a new project',
    builder: () => {},
    handler: () => {
      clear();
      project.New();
    }
  }).command({
    command: 'test',
    aliases: ['t'],
    desc: 'Execute unit tests',
    builder: (yargs) => {
      yargs.option('logs', {
        desc: "Show the full output",
        type: 'boolean'
      })
    },
    handler: (argv) => {
      validateDirectory();
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
    handler: (argv) => {
      validateDirectory();
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
    handler: (argv) => {
      validateDirectory();
      commands.deleteModel(argv.modelName,argv.DROP);
    }
  })
  .command({
    command: 'info',
    aliases: ['i'],
    desc: 'Show the information about the developers',
    builder: () => {},
    handler: () => {
      console.log(chalk.bgGreen('Made by :')+ "\n Amaury Deflorenne \n Romain Verliefden \n Samuel Antoine \n Steve Lebleu");
    }
  })
  .command({
    command:"start",
    aliases : [],
    desc: "Start the api server",
    builder: () =>{},
    handler: () => {
      validateDirectory();
      console.log(chalk.bgYellow(chalk.black('To quit the process press CTRL+C and validate')));
      commands.startServer();
    }
  })
  .command({
    command:'migrate',
    aliases: ["mig", "M"],
    desc: "Generate, compile and run the migration",
    builder: () => {},
    handler: () => {
      validateDirectory();
      commands.migrate();
    }
  })
  // provide a minimum demand and a minimum demand message
  .demandCommand(1, 'You need at least one command before moving on')
  .help().scriptName('tpf')
  .argv;
