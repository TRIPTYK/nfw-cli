#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @author Samuel Antoine
 */
var yargs = require("yargs");
// base cli dir
//@ts-ignore
global.__baseDir = __dirname;
yargs
    .strict()
    .command(require('./commands/newCommand'))
    .command(require('./commands/startUnitTestsCommand'))
    .command(require('./commands/generateCommand'))
    .command(require('./commands/generateFromDatabaseCommand'))
    .command(require('./commands/generateEmberDataModelCommand'))
    .command(require('./commands/deleteCommand'))
    .command(require('./commands/infoCommand'))
    .command(require('./commands/startCommand'))
    .command(require('./commands/migrateCommand'))
    .command(require('./commands/createSuperUserCommand'))
    .command(require('./commands/createRelationCommand'))
    .command(require('./commands/removeRelationCommand'))
    .command(require('./commands/editModelCommand'))
    .command(require('./commands/editEnvCommand'))
    .command(require('./commands/addEnvCommand'))
    .command(require('./commands/generateDocumentationCommand'))
    .command(require('./commands/initCommand'))
    .command(require('./commands/installDockerCommand'))
    .command(require('./commands/deployCommand'))
    .command(require('./commands/switchEnvCommand'))
    // provide a minimum demand and a minimum demand message
    .demandCommand(1, 'You need at least one command before moving on')
    .help()
    .scriptName('nfw')
    .argv;
