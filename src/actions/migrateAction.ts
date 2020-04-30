/**
 * @author Antoine Samuel
 * @author Deflorenne Amaury
 * @description Generate and executes a migration
 * @module migrateAction
 */

import { AdaptatorStrategy } from "../database/AdaptatorStrategy";

// Node modules
import child_process = require('child_process');
import path = require('path');
import Log = require('../utils/log');
import { MongoConnection } from "../database/mongoAdaptator";
import mkdirp = require("mkdirp");


const _buildErrorObjectFromMessage = (e: Error) => {
    const msgReg = /^\s*(\w+):\s*([ -+|\--z]*),?/gm;
    let m;
    let errObj = <any>{};

    while ((m = msgReg.exec(e.message)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === msgReg.lastIndex) {
            msgReg.lastIndex++;
        }
        
        let [,property,content] = m;

        errObj[property] = content
            .replace(/^'|'$/g,"")
            .replace(/\\'/g,"'");
    }   
    return errObj;
}

/*
 * Main function
 * @param modelName
 * @param restore
 * @param dump 
 * @returns {Promise<array>}
 */
export class MigrateActionClass {
    strategy: AdaptatorStrategy;
    modelName: string;
    directory?:string;

    constructor(strategy: AdaptatorStrategy, modelName: string, directory?: string){
        this.strategy = strategy;
        this.modelName = modelName;
        this.directory = directory;
    }

    setStrategy (strategy: AdaptatorStrategy){
        this.strategy = strategy;
    }

    async main(){
        const typeorm_cli = path.resolve('.', 'node_modules', 'typeorm', 'cli.js');
        const ts_node = path.resolve('.', 'node_modules', '.bin', 'ts-node');   

        await mkdirp(`${this.directory}/failed`);

        //typeorm generate feature currently doesn't work with mongodb so an empty migration is created when using Mongodb
        //To use migrations with a Mongo database, migrations must be written by hand in src/migration/development/migration_name
        if(this.strategy instanceof MongoConnection){
            child_process.spawnSync(`${ts_node} ${typeorm_cli} migration:create -n ${this.modelName}`, {stdio : 'inherit', shell: true});
        } else {
            child_process.spawnSync(`${ts_node} ${typeorm_cli} migration:generate -n ${this.modelName}`, { stdio : 'inherit',shell: true });
        }

        const {stdout,stderr,status} = child_process.spawnSync(`${ts_node} ${typeorm_cli} migration:run`,{ stdio : 'inherit',shell: true});

        return status === 0;
    }
};