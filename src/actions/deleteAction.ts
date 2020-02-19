/**
 * @module delete
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 * @description Delete entity files
 */

import {forEachStructureChild, StructureTypeGuards} from 'ts-morph';

// Node modules
import FS = require('fs');
import Util = require('util');
import snake = require('to-snake-case');

// Project modules
import { getSqlConnectionFromNFW  } from '../database/sqlAdaptator';
import Log = require('../utils/log');
import {items} from '../static/resources';
import {capitalizeEntity, lowercaseEntity} from './lib/utils';
import removeRel = require('./removeRelationAction');

import project = require('../utils/project');

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

    entityName: string;
    drop: boolean;

    constructor(entityName: string, drop: boolean){
        this.entityName = entityName;
        this.drop = drop;
    }

    async main (): Promise<any[]> {

        this.entityName = snake(this.entityName);
        //constructor behavior
        capitalize = capitalizeEntity(this.entityName);
        lowercase = lowercaseEntity(this.entityName);
    
        let dumpPath = `./dist/migration/dump/${+new Date()}-${this.entityName}`;
        const sqlConnection = await getSqlConnectionFromNFW();
    
        let relations = await sqlConnection.getForeignKeysRelatedTo(this.entityName).catch((err) => {
            throw new Error(`Failed to get foreign keys related to ${this.entityName}` + err)
        });
    
        for (let i = 0; i < relations.length; i++)
            await new removeRel.RemoveRelationAction(relations[i].TABLE_NAME, relations[i].REFERENCED_TABLE_NAME,relations[i].TABLE_NAME /*, relations[i].REFERENCED_TABLE_NAME*/)
                .main()
                .catch(() => {}); // not a problem
    
    
        let promises = [  // launch all tasks in async
            _deleteTypescriptFiles(),
            //_unroute()
        ];
    
        let results = await Promise.all(promises);
        let modifiedFiles = [];
    
        results.forEach((e) => {
            modifiedFiles = modifiedFiles.concat(e)
        });
    
        if (await sqlConnection.tableExists(this.entityName) && this.drop) {
            await sqlConnection.dumpTable(dumpPath, this.entityName)
                .then(() => Log.success(`SQL dump created at : ${dumpPath}`))
                .catch(() => {
                    throw new Error(`Failed to create dump`);
               });
    
            await sqlConnection.dropTable(this.entityName)
                .then(() => Log.success("Table dropped"))
                .catch(() => Log.error("Failed to delete table"));
        }
    
        await project.save();
    
        return modifiedFiles;
    };
    
}

