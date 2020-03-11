/**
 * @module newCommand
 * @description Command module to handle generation of a new project
 * @author Deflorenne Amaury
 */

// Node modules
import chalk from 'chalk';
import clearConsole = require('clear');
import { Spinner } from 'clui';

// Project imports
import { NewActionClass } from '../actions/newAction';
import migrateAction = require('../actions/migrateAction');
import createSuperUserAction = require('../actions/createSuperUserAction');
import Log = require('../utils/log');
import yargs = require('yargs');
import { Inquirer } from '../utils/inquirer';
import { AdaptatorStrategy } from '../database/AdaptatorStrategy';
import { MongoConnection } from '../database/mongoAdaptator';
import { SqlConnection } from '../database/sqlAdaptator';

//yargs comand
export const command: string = 'new <name>';

//yargs command aliases
export const aliases: string[] = ['n'];

//yargs command desc
export const describe: string = 'Generate a new project';


//Yargs command builder
export function builder (yargs: any) {
    yargs.option('default', {
        desc: "Generate a project with default env variables",
        type: "boolean",
        default: false
    });
    yargs.option('path', {
        desc: "Allow the user to choose a different path",
        type: 'boolean',
        default: false
    });
    yargs.option('yarn', {
        desc: "Set yarn as package manager instead of npm",
        type: 'boolean',
        default: false
    });
};


//Main function
export async function handler (argv: any){
    const name = argv.name;
    const defaultEnv = argv.default;
    const useDifferentPath = argv.path;
    const useYarn = argv.yarn;

    clearConsole();

    console.log(
        chalk.blue(
            'NFW'
        )
    );

    let envVar = await new Inquirer().askForEnvVariable();
    let databaseStrategy: AdaptatorStrategy;

    if(envVar.TYPEORM_TYPE === 'mongodb'){
        envVar.TYPEORM_PORT = '27017';
        databaseStrategy = new MongoConnection();
    } else {
        envVar.TYPEORM_PORT = '3306';
        databaseStrategy = new SqlConnection();
    }

    // process cwd is changed in newAction to the new project folder
    await new NewActionClass(envVar, name, !defaultEnv, useDifferentPath, useYarn).main()
        .then(() => {
            Log.success("New project generated successfully");
        })
        .catch((e) => {
            console.log(e);
            Log.error("Error when generating new project : " + e.message);
            process.exit();
        });

    const migrationSpinner = new Spinner("Executing migration ...");
    migrationSpinner.start();

    await new migrateAction.MigrateActionClass(databaseStrategy, "init_project").main()
        .then((generated: any) => {
            const [migrationDir] = generated;
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            Log.error("Failed to execute migration : " + e.message);
        });

    migrationSpinner.stop();

    await new createSuperUserAction.CreateSuperUSerActionClass(databaseStrategy, "admin").main()
        .then((generated: any) => {
            const [ filePath ] = generated;

            Log.info(`Created ${filePath}`);

            console.log(
                chalk.bgYellow(chalk.black('/!\\ WARNING /!\\ :')) +
                `\nA Super User named ${chalk.red('admin')} has been generated for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsibility to change this password to your own password`
            );
        })
        .catch((e) => {
            Log.error("Failed to create super user : " + e.message);
        });

    process.exit();
};
