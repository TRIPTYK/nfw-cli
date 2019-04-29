/**
 * @module generateAction
 * @description Generate a Typeorm entity from questions
 * @author Verliefden Romain
 */

// node modules
const {Spinner} = require('clui');
const chalk = require('chalk');

// project modules
const modelWriteAction = require('./writeModelAction');
const utils = require('./lib/utils');
const inquirer = require('../utils/inquirer');
const createRelationAction = require('./createRelationAction');
const modelSpecs = require('./lib/modelSpecs');
const generateEntityFiles = require('./lib/generateEntityFiles');
const Log = require('../utils/log');
const { format } =require('../actions/lib/utils');
const { getSqlConnectionFromNFW } = require('../database/sqlAdaptator');


/**
 * Main function
 * @param modelName
 * @param crud
 * @returns {Promise<void>}
 */
module.exports = async (modelName, crud) => {
    modelName = format(modelName);
    const modelExists = await utils.modelFileExists(modelName);
    const sqlConnection = getSqlConnectionFromNFW();

    if (modelExists) {
        const {confirmation} = await inquirer.askForConfirmation(`${chalk.magenta(modelName)} already exists, will you overwrite it ?`);
        if (!confirmation) {
            Log.error('/!\\ Process Aborted /!\\');
            process.exit(0);
        }
    }

    const spinner = new Spinner("Checking for existing entities ....");
    spinner.start();
    const isExisting = await sqlConnection.tableExists(modelName);
    spinner.stop();

    let entityModelData = null;


    const data = await inquirer.askForChoice(isExisting);
    switch (data.value) {
        case "create an entity":
            entityModelData = await modelSpecs.dbParams(modelName);
            await modelWriteAction.writeModel(modelName, entityModelData)
                .catch(e => {
                    Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                    process.exit(1);
                });
            break;
        case "create a basic model":
            await modelWriteAction.basicModel(modelName)
                .catch(e => {
                    Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                    process.exit(1);
                });
            entityModelData = [];
            entityModelData['columns'] = [];
            entityModelData['foreignKeys'] = [];
            entityModelData['createUpdate'] = {
                createAt: true,
                updateAt: true
            };
            break;
        case "nothing":
            console.log(chalk.bgRed(chalk.black(" /!\\ Process aborted /!\\")));
            process.exit(0);
            break;
        case 'create from db':
            let { columns, foreignKeys } = await sqlConnection.getTableInfo(modelName);
            for (let j = 0; j < columns.length; j++) {
                columns[j].Type = utils.sqlTypeData(columns[j].Type);
            }
            entityModelData = { columns, foreignKeys };
            await modelWriteAction.writeModel(modelName, entityModelData)
                .catch(e => {
                    Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                    process.exit(1);
                });
            if (foreignKeys && foreignKeys.length) {
                for (let i = 0; i < foreignKeys.length; i++) {
                    let tmpKey = foreignKeys[i];
                    let response = (await inquirer.askForeignKeyRelation(tmpKey)).response;
                    await createRelationAction(tmpKey.TABLE_NAME, tmpKey.REFERENCED_TABLE_NAME, response, tmpKey.COLUMN_NAME, tmpKey.REFERENCED_COLUMN_NAME)
                        .then(() => Log.success("Relation successfully added !"))
                        .catch((err) => Log.error(`${err.message}\nFix the issue then run nfw ${response} ${tmpKey.TABLE_NAME} ${tmpKey.REFERENCED_TABLE_NAME}`));
                }
            }
            break;
    }

    await generateEntityFiles(modelName, crud, entityModelData)
        .catch(e => {
            console.log(e);
            Log.error(`Generation failed : ${e}\nExiting ...`);
            process.exit(1);
        });
};
