/**
 * @module createSuperUserCommand
 * @description Creates a super user in the boilerplate database
 * @author Deflorenne Amaury
 */

//Node modules imports
import chalk from 'chalk';

// Project imports
import commandUtils = require('./commandUtils');
import Log = require('../utils/log');
import createSuperUserAction = require('../actions/createSuperUserAction');
import { Singleton } from '../utils/DatabaseSingleton';
import { AdaptatorStrategy } from '../database/AdaptatorStrategy';


//Yargs command syntax
export const command: string = 'createUser <username>';

//Yargs command aliases
export const aliases: string[] = ['cu'];

//Yargs command description
export const describe: string = 'Create a Super User and save the credentials in a file';

//Yargs command builder
export function builder (yargs: any) {
    yargs.option('mail',{
        alias: 'e',
        type: 'string',
        description: 'Email address of the user'
    });
    yargs.option('role',{
        alias: 'r',
        type: 'string',
        description: 'Role of the user (ex : admin,user,ghost)'
    });
    yargs.option('password',{
        alias: 'p',
        type: 'string',
        description: 'Password of the user'
    });
};

//Main function
exports.handler = async (argv: any) => {
    const {username,mail,role,password} = argv;
    const strategyInstance = Singleton.getInstance();
    const databaseStrategy: AdaptatorStrategy = strategyInstance.setDatabaseStrategy();

    commandUtils.validateDirectory();

    commandUtils.updateORMConfig();

    await new createSuperUserAction.CreateSuperUserActionClass(databaseStrategy, username,mail,role,password).main()
        .then((generated) => {
            const [ filePath ] = generated;

            Log.info(`Created ${filePath}`);

            console.log(
                chalk.bgYellow(chalk.black('/!\\ WARNING /!\\ :')) +
                `\nYou have generated a ${role} user named ${chalk.red(username)} for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsibility to change this password to your own password`
            );
        })
        .catch((e) => {
            Log.error("Failed to create super user : " + e.message);
        });

    process.exit(0);
};
