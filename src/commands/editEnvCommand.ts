/**
 * @module editEnvCommand
 * @description Command module to handle environment file editing
 * @author Deflorenne Amaury
 */

// Node modules
import fs = require('fs');
import dotenv = require('dotenv');
import chalk = require('chalk');

// Project modules
import inquirer = require('../utils/inquirer');
import commandUtils = require('./commandUtils');
import editEnvAction = require('../actions/editEnvAction');
import Log = require('../utils/log');

//Yargs command
export const command: string = 'editENV';

//Yargs command aliases
export const aliases: string[] = ["ee", "editE"];

//Yargs command description
export const describe: string = 'Ask a series of questions to edit the environement files';

//Yargs command builder
export function builder () {};

//Main function
export async function handler (): Promise<void> {

    commandUtils.validateDirectory();

    let files = fs.readdirSync('./');

    // select only env files
    let envFiles = files.filter((file) => file.includes('.env')).map((fileName) => fileName.substr(0, fileName.lastIndexOf('.')));

    let {env} = await new inquirer.Inquirer().choseEnvFile(envFiles);
    const envFileName = `${env}.env`;
    let chosenOne = dotenv.parse(fs.readFileSync(envFileName));

    await new editEnvAction.EditEnvActionClass(env, chosenOne).Main()
        .then((written) => {
            const [confFile] = written;
            Log.success(`Edited environment successfully`);
            Log.info(`Updated ${confFile}`);
        })
        .catch((e) => {
            Log.error(`Cannot edit ${envFileName} : ` + e.message);
        });
};