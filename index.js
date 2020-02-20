#!/usr/bin/env node
"use strict";
exports.__esModule = true;
/**
 * @author Samuel Antoine
 */
var yargs = require("yargs");
// base cli dir
//global.__baseDir = __dirname;
yargs
    .strict()
    .command(require('./dist/commands/newCommand'))
    .command(require('./dist/commands/startUnitTestsCommand'))
    .command(require('./dist/commands/generateCommand'))
    .command(require('./dist/commands/generateFromDatabaseCommand'))
    .command(require('./dist/commands/generateEmberDataModelCommand'))
    .command(require('./dist/commands/deleteCommand'))
    .command(require('./dist/commands/infoCommand'))
    .command(require('./dist/commands/startCommand'))
    .command(require('./dist/commands/migrateCommand'))
    .command(require('./dist/commands/createSuperUserCommand'))
    .command(require('./dist/commands/createRelationCommand'))
    .command(require('./dist/commands/removeRelationCommand'))
    .command(require('./dist/commands/editModelCommand'))
    .command(require('./dist/commands/editEnvCommand'))
    .command(require('./dist/commands/addEnvCommand'))
    .command(require('./dist/commands/generateDocumentationCommand'))
    .command(require('./dist/commands/generateRouteCommand'))
    .command(require('./dist/commands/initCommand'))
    .command(require('./dist/commands/installDockerCommand'))
    .command(require('./dist/commands/deployCommand'))
    .command(require('./dist/commands/switchEnvCommand'))
    .command(require('./dist/commands/seedCommand'))
    // provide a minimum demand and a minimum demand message
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .scriptName('nfw')
    .argv;
