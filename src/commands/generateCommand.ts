/**
 * @module generateCommand
 * @description Command module to handle dynamic entity files generation for the boilerplate
 * @author Deflorenne Amaury
 */

// Node modules imports
import reservedWords = require('reserved-words');
import { Spinner } from 'clui';
import chalk from 'chalk';

// Project imports
import commandUtils = require('./commandUtils');
import generateAction = require('../actions/generateAction');
import migrateAction = require('../actions/migrateAction');
import generateDocAction = require('../actions/generateDocumentationAction');
import Log = require('../utils/log');
import main from 'mysqldump';


const generateDocSpinner = new Spinner('Generating documentation');


//Yargs command
export const command: string = 'generate <modelName> [CRUD] [part]';

//Yargs command aliases
export const aliases: string[] = ['gen', 'g'];

//Yargs command description
export const describe: string = 'Generate a new model';

//Yargs command builder
export function builder (yargs: any) {
    yargs.default('CRUD', 'CRUD');
    yargs.default('part', null);
};


//Main function 
export async function handler  (argv: any): Promise<void> {

    const {modelName,crud,part} = argv;

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();
    await commandUtils.checkConnectToDatabase();

    if (reservedWords.check(modelName, 6)) {
        console.log("modelName is a reserved word");
        process.exit(0);
    }

    let crudOptions = {
        create: true,
        read: true,
        update: true,
        delete: true
    };
    
    if ((/^[crud]{1,4}$/).test(crud)) {
        crudOptions.create = crud.includes('c');
        crudOptions.read = crud.includes('r');
        crudOptions.update = crud.includes('u');
        crudOptions.delete = crud.includes('d');
    }

    await new generateAction.GenerateActionClass(modelName, crudOptions , part).main();

    const spinner = new Spinner("Generating and executing migration");
    spinner.start();

    await new migrateAction.MigrateActionClass(modelName).main()
        .then((generated) => {
            const [migrationDir] = generated;
            spinner.stop();
            Log.success(`Executed migration successfully`);
            Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
        })
        .catch((e) => {
            Log.error(e.message);
            process.exit();
        });


    generateDocSpinner.start();

    await new generateDocAction.GenerateDocumentationActionClass().main()
        .then(() => {
            Log.success('Typedoc generated successfully');
        })
        .catch((e) => {
            Log.error('Typedoc failed to generate : ' + e.message);
        });

    generateDocSpinner.stop();

    process.exit();
};