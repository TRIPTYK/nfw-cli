#!/usr/bin/env node
/**
 * @author Samuel Antoine
 */
const yargs = require('yargs');

// base cli dir
global.__baseDir = __dirname;

yargs
    .strict()
    .command(require('./dist/commands/newCommand'))
    .command(require('./src/commands/startUnitTestsCommand'))
    .command(require('./src/commands/generateCommand'))
    .command(require('./src/commands/generateFromDatabaseCommand'))
    .command(require('./src/commands/deleteCommand'))
    .command(require('./dist/commands/infoCommand'))
    .command(require('./src/commands/startCommand'))
    .command(require('./src/commands/migrateCommand'))
    .command(require('./src/commands/createSuperUserCommand'))
    .command(require('./src/commands/createRelationCommand'))
    .command(require('./src/commands/removeRelationCommand'))
    .command(require('./src/commands/editModelCommand'))
    .command(require('./src/commands/editEnvCommand'))
    .command(require('./src/commands/addEnvCommand'))
    .command(require('./src/commands/generateDocumentationCommand'))
    .command(require('./src/commands/generateRouteCommand'))
    .command(require('./src/commands/initCommand'))
    .command(require('./src/commands/installDockerCommand'))
    .command(require('./src/commands/deployCommand'))
    .command(require('./src/commands/switchEnvCommand'))
    .command(require('./src/commands/seedCommand'))
    // provide a minimum demand and a minimum demand message
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .scriptName('nfw')
    .argv;