/**
 * @module generateAction
 * @description Generate a Typeorm entity from questions
 * @author Verliefden Romain
 */

// node modules
import {Spinner} from 'clui';
import chalk from 'chalk';

// project modules
import modelWriteAction = require('./writeModelAction');
import utils = require('./lib/utils');
import {Inquirer} from '../utils/inquirer';
import createRelationAction = require('./createRelationAction');
import modelSpecs = require('./lib/modelSpecs');
import generateEntityFiles = require('./lib/generateEntityFiles');
import Log = require('../utils/log');
import { format } from '../actions/lib/utils';
import { AdaptatorStrategy } from '../database/AdaptatorStrategy';
import { MongoConnection } from '../database/mongoAdaptator';


export class GenerateActionClass {

    databaseStrategy: AdaptatorStrategy
    modelName: string;
    crud: object;
    part: string;

    constructor(databaseStrategy: AdaptatorStrategy, modelName: string, crud: object, part: string){
        this.databaseStrategy = databaseStrategy;
        this.modelName = modelName;
        this.crud = crud;
        this.part = part;
    }

    async main (): Promise<void> {

        this.modelName = format(this.modelName);
        const modelExists = await utils.modelFileExists(this.modelName);
        const databaseConnection =  await this.databaseStrategy.getConnectionFromNFW();
        const inquirer = new Inquirer();
    
        if (modelExists) {
            const {confirmation} = await inquirer.askForConfirmation(`${chalk.magenta(this.modelName)} already exists, will you overwrite it ?`);
            if (!confirmation) {
                Log.error('/!\\ Process Aborted /!\\');
                process.exit(0);
            }
        }
    
        const spinner = new Spinner("Checking for existing entities ....");
        spinner.start();
        const isExisting = await databaseConnection.tableExists(this.modelName);
        spinner.stop();
    
        let entityModelData = null;
        const dbType = this.databaseStrategy instanceof MongoConnection ? "mongo" : "other";
    
        const data = await inquirer.askForChoice(isExisting);
    
        switch (data.value) {
            case "create an entity":
                entityModelData = await modelSpecs.dbParams(this.modelName);
                if (!this.part || this.part === "model")
                    await modelWriteAction.writeModel(this.modelName, entityModelData, dbType)
                        .catch(e => {
                            console.log(e);
                            Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                            process.exit(1);
                        });
                break;
            case "create empty entity":
                if (!this.part || this.part === "model")
                    await modelWriteAction.basicModel(this.modelName, dbType)
                        .catch(e => {
                            Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                            process.exit(1);
                        });
    
                entityModelData = [];
                entityModelData['columns'] = [];
                entityModelData['foreignKeys'] = [];
                break;
            case "nothing":
                console.log(chalk.bgRed(chalk.black(" /!\\ Process aborted /!\\")));
                process.exit(0);
                break;
            case 'create from db':
                let { columns, foreignKeys } = await databaseConnection.getTableInfo(this.modelName);
                // in base class model
                columns = columns.filter((c) => !["updated_at","created_at","id"].includes(c.Field));


                for (let j = 0; j < columns.length; j++) {
                    columns[j].Type = utils.sqlTypeData(columns[j].Type);
                }
                entityModelData = { columns, foreignKeys };
    
                if (!this.part || this.part === "model") {
                    await modelWriteAction.writeModel(this.modelName, entityModelData, dbType)
                        .catch(e => {
                            Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                            process.exit(1);
                        });
                }
    
                if (foreignKeys && foreignKeys.length) {
                    for (let i = 0; i < foreignKeys.length; i++) {
                        let tmpKey = foreignKeys[i];
                        let response = (await inquirer.askForeignKeyRelation(tmpKey)).response;
                        let {m1Name, m2Name} = await inquirer.questionM1M2(tmpKey.TABLE_NAME, tmpKey.REFERENCED_TABLE_NAME);
                        await new createRelationAction.CreateRelationActionClass(tmpKey.TABLE_NAME, tmpKey.REFERENCED_TABLE_NAME, response, tmpKey.COLUMN_NAME, tmpKey.REFERENCED_COLUMN_NAME, m1Name, m2Name)
                            .main()
                            .then(() => Log.success("Relation successfully added !"))
                            .catch((err) => Log.error(`${err.message}\nFix the issue then run nfw ${response} ${tmpKey.TABLE_NAME} ${tmpKey.REFERENCED_TABLE_NAME}`));
                    }
                }
                break;
        }
    
        await generateEntityFiles.main(this.modelName, this.crud, entityModelData, this.part)
            .catch(e => {
                console.log(e);
                Log.error(`Generation failed : ${e}\nExiting ...`);
                process.exit(1);
            });
    }

}
