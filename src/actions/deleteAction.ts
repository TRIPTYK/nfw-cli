/**
 * @module delete
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 * @description Delete entity files
 */


// Node modules
import FS = require('fs');
import Util = require('util');
import child_process = require('child_process');
import snake = require('to-snake-case');
import JsonFileWriter = require("json-file-rw");

// Project modules
import { AdaptatorStrategy } from "../database/AdaptatorStrategy";
import Log = require('../utils/log');
import {items} from '../static/resources';
import {capitalizeEntity, lowercaseEntity} from './lib/utils';
import { RemoveRelationActionClass } from './removeRelationAction';

import project = require('../utils/project');
import { MongoConnection } from '../database/mongoAdaptator';
import { SqlConnection } from '../database/sqlAdaptator';
import { DatabaseEnv } from '../database/DatabaseEnv';

// simulate class properties
let capitalize;
let lowercase;

/**
 *  @description deletes typescript files
 *  @returns {Promise<Array>}
 */
const _deleteTypescriptFiles = async (): Promise<any[]> => {

    let deleted = [];

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const file = project.getSourceFile(`${item.path}/${lowercase}.${item.template}.ts`);
        if (file) {
            deleted.push({fileName: `${item.path}/${lowercase}.${item.template}.ts`, type: 'delete'});
            file.delete();
        }
    }

    return deleted;
};

/**
 * @description Delete route related information in router index.ts
 * @returns {Promise<{fileName: string, type: string}[]>} deleted route
 */
const _unroute = async (): Promise<{fileName: string, type: string}[]> => {
    const fileName = `src/api/routes/v1/index.ts`;
    const file = project.getSourceFile(fileName);

    file.getStatementsWithComments().forEach((e) => {
        if(e.getText().includes(`${capitalize}Router`))
            e.remove();
    });

    return [{type: 'edit', fileName: fileName}];
};


/**
 * @description Module export main entry , it deletes generated files
 * @param {string} entityName
 * @param {boolean} drop if true , drop the table in database
 * @returns {Promise<Array>}
 */
export class DeleteActionClass {

    databaseStrategy: AdaptatorStrategy;
    entityName: string;
    drop: boolean;

    constructor(databaseStrategy: AdaptatorStrategy, entityName: string, drop: boolean){
        this.databaseStrategy = databaseStrategy;
        this.entityName = entityName;
        this.drop = drop;
    }

    async main (): Promise<any[]> {

        this.entityName = snake(this.entityName);
        //constructor behavior
        capitalize = capitalizeEntity(this.entityName);
        lowercase = lowercaseEntity(this.entityName);
        const nfwConfig = new JsonFileWriter();
        nfwConfig.openSync(".nfw");
        const currentEnv = nfwConfig.getNodeValue("env","development");
        const envValues = new DatabaseEnv(`${currentEnv}.env`).getEnvironment();
    
        let dumpPath = `./dist/migration/dump/${+new Date()}-${this.entityName}`;


        const databaseConnection = await this.databaseStrategy.getConnectionFromNFW();

        if(this.databaseStrategy instanceof SqlConnection) {

            let relations = await databaseConnection.getForeignKeysRelatedTo(this.entityName).catch((err) => {
                throw new Error(`Failed to get foreign keys related to ${this.entityName}` + err)
            });
        
            for (let i = 0; i < relations.length; i++)
                await new RemoveRelationActionClass(relations[i].TABLE_NAME, relations[i].REFERENCED_TABLE_NAME,relations[i].TABLE_NAME /*, relations[i].REFERENCED_TABLE_NAME*/)
                    .main()
                    .catch(() => {}); // not a problem
        
        }
    
        
    
        let promises = [  // launch all tasks in async
            _deleteTypescriptFiles(),
            //_unroute()
        ];
    
        let results = await Promise.all(promises);
        let modifiedFiles = [];
    
        results.forEach((e) => {
            modifiedFiles = modifiedFiles.concat(e)
        });
    
        if (await databaseConnection.tableExists(this.entityName) && this.drop) {

            if(this.databaseStrategy instanceof MongoConnection) {

                child_process.spawnSync(`mongodump --host=${envValues.TYPEORM_HOST} --port=${envValues.TYPEORM_PORT} --username=${envValues.TYPEORM_USER} --password=${envValues.TYPEORM_PWD} --db=${envValues.TYPEORM_DB} --authenticationDatabase=admin --collection=${this.entityName} -o ./dist/migration/dump`, 
                {stdio : 'inherit', shell: true});
            }

            if(this.databaseStrategy instanceof SqlConnection) {

                await databaseConnection.dumpTable(dumpPath, this.entityName)
                .then(() => Log.success(`SQL dump created at : ${dumpPath}`))
                .catch(() => {
                    throw new Error(`Failed to create dump`);
               });

            }

            await databaseConnection.dropTable(this.entityName)
                    .then(() => Log.success("Table/Collection dropped"))
                    .catch(() => Log.error("Failed to delete table/Collection"));
            }

    
        await project.save();
    
        return modifiedFiles;
    };
    
}

