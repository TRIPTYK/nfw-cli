#!/usr/bin/env node
/**
 * @author Samuel Antoine
 */
const clear = require('clear');
const project = require('./utils/New');
const files = require('./utils/files');
const yargs = require('yargs');
const chalk = require('chalk');
const commands = require('./utils/execShellCommands');
const test = require('./utils/tests');
const sql = require('./database/sqlAdaptator');
const reserved = require('reserved-words');
const Log = require('./utils/log');
const utils = require('./generate/utils');

const validateDirectory = () => {
    if (!files.isProjectDirectory()) {
        console.log(chalk.bgRed(chalk.black('ERROR ! : You are not in a project directory')));
        process.exit(0);
    }
};
yargs
    .strict()
    .command({
        command: 'new',
        aliases: ['n'],
        desc: 'Generate a new project',
        builder: (yargs) => {
            yargs.option('default', {
                desc: "Generate a project with default env variables",
                type: "boolean"
            });
            yargs.option('path', {
                desc: "Allow the user to choose a different path",
                type: 'boolean'
            });
            yargs.option('docker', {
                desc: "Set a mysql container up",
                type: 'boolean'
            });
            yargs.option('yarn', {
                desc: "Set yarn as package manager",
                type: 'boolean'
            });
        },
        handler: async (argv) => {
            clear();
            if (argv._[1] === undefined) {
                console.log(chalk.red('Please provide a name for your application'));
                process.exit(0);
            }
            project.New(argv._[1], argv.default === undefined, argv.path !== undefined, argv.docker !== undefined, argv.yarn !== undefined);
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
        test.execUnitTests(argv.logs !== undefined);
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
            if (await reserved.check(argv.modelName, 6)) {
                console.log("modelName is a reserved word");
                process.exit(0);
            }
            commands.generateModel(argv.modelName, argv.CRUD);
        }
    })
    .command({
        command: 'import',
        aliases: ["imp"],
        desc: "Generate all the files from existing tables in the databse",
        builder: () => {
        },
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
                DROP: {
                    default: false,
                    type: 'boolean'
                }
            })
        },
        handler: async (argv) => {
            validateDirectory();
            if (argv.DROP) await sql.checkConnexion();
            commands.deleteModel(argv.modelName, argv.DROP);
        }
    })
    .command(require('./commands/infoCommand'))
    .command(require('./commands/startCommand'))
    .command({
        command: 'migrate  <migrateName>',
        aliases: ["mig", "M"],
        desc: "Generate, compile and run the migration",
        builder: () => {
        },
        handler: async (argv) => {
            validateDirectory();
            await sql.checkConnexion();
            if (await reserved.check(argv.modelName, 6)) {
                console.log("modelName is a reserved word");
                process.exit(0);
            }
            commands.migrate(argv.migrateName);
        }
    })
    .command(require('./commands/createSuperUserCommand'))
    .command({
        command: 'addRelationship <relation> <model1> <model2>',
        aliases: ['ar', 'addR'],
        desc: 'Create  relation between two table',
        builder: (yargs) => {
            yargs.option('name', {
                desc: "Specify the name of foreign key (for Oto) or the name of the bridging table (for Mtm)",
                type: "string",
                default: null
            })
                .option('refCol', {
                    desc: "Specify referenced column for a oto relation",
                    type: "string",
                    default: null
                })
        },
        handler: async (argv) => {
            validateDirectory();
            await sql.checkConnexion();
            commands.createRelation(argv.model1, argv.model2, argv.relation, argv.name, argv.refCol);
        }
    })
    .command({
        command: 'removeRelation <model1> <model2>',
        aliases: ['rr', 'rmRl'],
        desc: 'Create  relation between two table',
        builder: () => {
        },
        handler: async (argv) => {
            validateDirectory();
            await sql.checkConnexion();
            commands.rmRelation(argv.model1, argv.model2);
        }
    })
    .command({
        command: 'editModel <model> <action> [column]',
        aliases: ["em", "edit"],
        desc: 'add or remove column in a model',
        builder: () => {
        },
        handler: async (argv) => {
            validateDirectory();
            await sql.checkConnexion();
            if (!utils.modelFileExists(argv.model)) {
                Log.error("Model should exist in order to edit him :)");
                process.exit(0);
            }
            if (argv.action === 'add') commands.editModel('add', argv.model);
            else if (argv.action === 'remove' && argv.column !== undefined) commands.editModel('remove', argv.model, argv.column);
            else if (argv.action === 'remove' && argv.column === undefined) Log.info("you must specify the column to remove");
            else Log.info("action must be add or remove");
        }
    })
    .command({
        command: "editENV",
        aliases: ["ee", "editE"],
        desc: 'Ask a series of questions to edit the environement files',
        builder: () => {
        },
        handler: async () => {
            await commands.editENVFiles();
        }

    })
    .command({
        command: "addENV <name>",
        aliases: ["ae", "addE"],
        desc: 'Generate a new environement based on asked question',
        builder: () => {
        },
        handler: async (argv) => {
            await commands.newEnvFile(argv.name);
        }
    })
    // provide a minimum demand and a minimum demand message
    .demandCommand(1, 'You need at least one command before moving on')
    .help().scriptName('nfw')
    .argv;
