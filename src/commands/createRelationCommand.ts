/**
 * @module createRelationCommand
 * @description Command module to handle creating relation between 2 models
 * @author Deflorenne Amaury
 */

// Project imports
import commandUtils = require('./commandUtils');
import { MigrateActionClass } from '../actions/migrateAction';
import { CreateRelationActionClass } from '../actions/createRelationAction';
import Log = require('../utils/log');
import {format} from '../actions/lib/utils';

//node modules
import {Spinner} from 'clui';
import chalk from 'chalk';
import {singular} from 'pluralize';
import { AdaptatorStrategy } from '../database/AdaptatorStrategy';
import { SqlConnection } from '../database/sqlAdaptator';
import { Singleton } from '../utils/DatabaseSingleton';


//Yargs command syntax
export const command: string = 'addRelationship <relation> <model1> <model2>';

//Aliases for Yargs command
export const aliases: string[] = ['ar', 'addR'];

//Command description
export const describe: string = 'Create  relation between two table. Only works with MySQL Databases';


//Handle and build command options
export function builder (yargs: any) {
    yargs.choices('relation',['mtm','mto','otm','oto']);
    yargs.option('name', {
        desc: "Specify the name of foreign key (for Oto) or the name of the bridging table (for Mtm)",
        type: "string",
        default: null
    });
    yargs.option('refCol', {
        desc: "Specify referenced column for a oto relation",
        type: "string",
        default: null
    });
    yargs.option('m1Name', {
        desc: "Specify the name of the column for the first model",
        type: "string",
        default: null
    });
    yargs.option('m2Name', {
        desc: "Specify the name of the column for the second model",
        type: "string",
        default: null
    });
};

/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
//Main function 
export async function handler (argv: any): Promise<void> {

    const strategyInstance = Singleton.getInstance();
    const databaseStrategy = strategyInstance.setDatabaseStrategy();

    commandUtils.validateDirectory();
    await commandUtils.checkVersion();
    await commandUtils.checkConnectToDatabase(databaseStrategy);

    const model1 = format(argv.model1);
    const model2 = format(argv.model2);
    const relation = argv.relation;
    const name = argv.name;
    const refCol = argv.refCol;
    let m1Name,m2Name;
    
    m1Name = argv.m1Name ? singular(format(argv.m1Name)) : model1;
    m2Name = argv.m2Name ? singular(format(argv.m2Name)) : model2;

    await new CreateRelationActionClass(model1, model2, relation, name, refCol , m1Name , m2Name).main()
        .then(async () => {
            Log.success("Relation successfully added !");
            const spinner = new Spinner("Generating and executing migration");
            spinner.start();
            await new MigrateActionClass(databaseStrategy, `${model1}-${model2}`).main()
                .then((generated) => {
                    spinner.stop();
                    const [migrationDir] = generated;
                    Log.success(`Executed migration successfully`);
                    Log.info(`Generated in ${chalk.cyan(migrationDir)}`);
                })
                .catch((e) => {
                    spinner.stop();
                    Log.error(e.message);
                });
        })
        .catch((err) => Log.error(err.message));
    process.exit(0);    
};
