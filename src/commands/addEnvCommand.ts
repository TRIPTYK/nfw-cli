/**
 * @module addEnvCommand
 * @description  Command module for creating a new environment file
 * @author Deflorenne Amaury
 */

// Node modules
import fs = require('fs');
import dotenv = require('dotenv');
import chalk from 'chalk';

// Project modules
import { EditEnvActionClass } from '../actions/editEnvAction';
import commandUtils = require('./commandUtils');
import Log = require('../utils/log');

//Yargs command syntax
export const command: string = 'addENV <env>';

//Yargs command alias
export const aliases: string[] = ["ae", "addE"];

//Command description
export const describe: string = 'Generate a new environement based on asked question';

//Yargs builder
export function builder (){};


//description : Main command handler
export async function handler (argv: any): Promise<void> {
    const env = argv.env;

    commandUtils.validateDirectory();

    console.log(chalk.blue('The default choices are based on the default environement setting -> developement.env'));

    let chosenOne = dotenv.parse(fs.readFileSync(`development.env`));

    await new EditEnvActionClass(env, chosenOne).main()
        .then((written) => {
            const [envFile] = written;
            Log.success(`New environment generated successfully`);
            Log.info(`Created ${chalk.cyan(envFile)}`);
        })
        .catch((e) => {
            Log.error("Failed to generate new environment : " + e.message);
        });
};
