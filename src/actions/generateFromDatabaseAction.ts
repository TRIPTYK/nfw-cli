/**
 * @author Verliefden Romain
 * @module generateFromDatabaseAction
 * @description Get all table from DB then call writeModel method for each table in the database
 */

// Project modules
import {Inquirer} from '../utils/inquirer';
import modelWrite = require('./writeModelAction');
import generateEntityFiles = require('./lib/generateEntityFiles');
import utils = require('./lib/utils');
import Log = require('../utils/log');
import { AdaptatorStrategy } from "../database/AdaptatorStrategy";
import createRelation = require('./createRelationAction');
import { MongoConnection } from '../database/mongoAdaptator';

const noGenerate = ['user', 'document', 'refresh_token', 'migration_table'];


export class GenerateFromDatabaseActionClass {

    async main(databaseStrategy: AdaptatorStrategy): Promise<void>{

        const databaseadaptor = await databaseStrategy.getConnectionFromNFW();
        const databaseName = databaseadaptor.environement.TYPEORM_DB;
        let p_tables = await databaseadaptor.getTables();
        let p_tablesIn = "Tables_in_" + databaseName;
        let Bridgings = [], foreignConstraint = [];
        let [tables, tablesIn] = await Promise.all([p_tables, p_tablesIn]);
        const dbType = databaseStrategy instanceof MongoConnection ? "mongo" : "other";

        let crudOptions = {
            create: true,
            read: true,
            update: true,
            delete: true
        };

        for (let j = 0; j < tables.length; j++) {
            let {columns, foreignKeys} = await databaseadaptor.getTableInfo(tables[j][tablesIn]);
            let entityModelData = {columns, foreignKeys};
            if (utils.isBridgindTable(entityModelData)) {
                Bridgings.push(foreignKeys);
                continue;
            }
            for (let j = 0; j < columns.length; j++) columns[j].Type = utils.sqlTypeData(columns[j].Type);
            for (let j = 0; j < foreignKeys.length; j++) foreignConstraint.push(foreignKeys[j]);
            if (noGenerate.includes(tables[j][tablesIn])) continue;
            await modelWrite.writeModel(tables[j][tablesIn], entityModelData, dbType)
                .catch(e => {
                    Log.error(`Failed to generate model : ${e.message}\nExiting ...`);
                    process.exit(1);
                });
            await generateEntityFiles.main(tables[j][tablesIn], crudOptions, entityModelData);
        }

        await this._BridgingTableHander(Bridgings);
        await this._RelationHandler(foreignConstraint);
    };


    _BridgingTableHander = async (Bridgings): Promise<void> => {
        const inquirer = new Inquirer();
        for (let j = 0; j < Bridgings.length; j++) {
            Log.info(`a reliationship has been detected between ${Bridgings[j][0].REFERENCED_TABLE_NAME} and ${Bridgings[j][1].REFERENCED_TABLE_NAME}`)
            let {m1Name,m2Name} = await inquirer.questionM1M2(Bridgings[j][0].REFERENCED_TABLE_NAME, Bridgings[j][1].REFERENCED_TABLE_NAME);
            await new createRelation.CreateRelationActionClass(Bridgings[j][0].REFERENCED_TABLE_NAME, Bridgings[j][1].REFERENCED_TABLE_NAME, 'mtm', Bridgings[j][0].TABLE_NAME, null,m1Name,m2Name)
                .main()
                .then(() => Log.success("Relation successfully added !"))
                .catch((err) => Log.error(err.message));
        }
    };


    _RelationHandler = async (foreignConstraint): Promise<void> => {
        const inquirer = new Inquirer();
        for (let j = 0; j < foreignConstraint.length; j++) {
            if(noGenerate.includes(foreignConstraint[j].TABLE_NAME) && noGenerate.includes(foreignConstraint[j].REFERENCED_TABLE_NAME)) continue;
            let {response} = await inquirer.askForeignKeyRelation(foreignConstraint[j]);
            let {m1Name,m2Name} = await inquirer.questionM1M2(foreignConstraint[j].TABLE_NAME, foreignConstraint[j].REFERENCED_TABLE_NAME);
            await new createRelation.CreateRelationActionClass(foreignConstraint[j].TABLE_NAME, foreignConstraint[j].REFERENCED_TABLE_NAME, response, m2Name, foreignConstraint[j].REFERENCED_COLUMN_NAME,m1Name,m2Name)
                .main()    
                .then(() => Log.success("Relation successfully added !"))
                .catch((err) => Log.error(err.message));
        }
    }
}
