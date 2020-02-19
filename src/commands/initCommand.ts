/**
 * @module initCommand
 * @description Command module to create a database, execute migration and create a super user
 * @author Antoine Samuel
 */
// Project imports
import commandUtils = require('../commands/commandUtils');
import Log = require('../utils/log');
import actionUtils = require('../actions/lib/utils');
import migrateAction = require('../actions/migrateAction');
import createSuperUserAction = require('../actions/createSuperUserAction');

//Node_modules import
import fs = require('fs');
import chalk from 'chalk';
import {Spinner} from 'clui';

//Yargs command
export const command: string = 'initialize';

 //Yargs command aliases
export const aliases: string[] = ['init'];

//Yargs command description
export const describe: string = 'Create a database if not existing, add tables and creates a super user';

//Yargs command builder
export function builder (yargs: any) {
    yargs.option('env', {
        desc: "Allow user to chose which environement to use",
        type: "string",
        default: 'development'
    });
};

/**
 * Main function
 * @return {void}
 */
export async function handler (argv: any): Promise<void> {
    commandUtils.validateDirectory();

    let files = fs.readdirSync('./');

    // select only env files
    let envFiles = files.filter((file) => file.includes('.env')).map((fileName) => fileName.substr(0, fileName.lastIndexOf('.')));
    if(!envFiles.includes(argv.env)){
        Log.error(`Error: ${argv.env} is not found, available environment are : ${envFiles}`);
        process.exit(0);
    }
    await actionUtils.createDataBaseIfNotExists(argv.env);
    const spinner = new Spinner("Generating and executing migration");
    spinner.start();

    await new migrateAction.MigrateActionClass("init").main()
        .then((generated) => {
            const [migrationDir] = generated;
            spinner.stop();
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            spinner.stop();
            Log.error(e.message);
        });
    await commandUtils.checkConnectToDatabase();


    await new createSuperUserAction.CreateSuperUSerActionClass("admin").main()
        .then((generated) => {
            const [ filePath ] = generated;

            Log.info(`Created ${filePath}`);

            console.log(
                chalk.bgYellow(chalk.black('/!\\ WARNING /!\\ :')) +
                `\nYou have generated a Super User named ${chalk.red("admin")} for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsibility to change this password to your own password`
            );
        })
        .catch((e) => {
            Log.error("Failed to create super user : " + e.message);
        });
    process.exit(0);
};
