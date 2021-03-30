// node modules
import spawn = require('cross-spawn');
import util = require('util');
import path = require('path');
const exec = util.promisify(require('child_process').exec);
import fs = require('fs');

// project modules
import { AdaptatorStrategy } from "../database/AdaptatorStrategy";
import { DatabaseEnv } from '../database/DatabaseEnv';
import Log = require('../utils/log');


export class DeployActionClass {

    databaseStrategy: AdaptatorStrategy;
    env: DatabaseEnv;
    mode: string;
    deployDB: boolean;

    constructor(databaseStrategy: AdaptatorStrategy, env: DatabaseEnv, mode: string, deployDB: boolean){
        this.databaseStrategy = databaseStrategy;
        this.env = env;
        this.mode = mode;
        this.deployDB = deployDB;
    }


    async main (): Promise<void> {
        const loadedEnv = new DatabaseEnv();
        loadedEnv.loadFromFile(this.env + '.env');

        const { deploy } = require(process.cwd() + "/ecosystem.config");

        if (!deploy.hasOwnProperty(this.env)) {
            throw new Error(`${this.env} environment does not exists`);
        }

        if (this.mode === 'setup') {
            spawn.sync(`./node_modules/.bin/pm2 deploy ${this.env} setup`, [], { stdio: 'inherit' , shell : true });
        }else if (this.mode === 'update') {
            spawn.sync(`./node_modules/.bin/pm2 deploy ${this.env} update`, [], { stdio: 'inherit' , shell : true });
        }else if (this.mode === 'revert') {
            spawn.sync(`./node_modules/.bin/pm2 deploy ${this.env} revert 1`, [], { stdio: 'inherit' , shell : true });
        }else{
            Log.warning("No action specified");
            process.exit(0);
        }
    }
}