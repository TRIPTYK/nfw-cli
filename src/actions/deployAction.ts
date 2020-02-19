// node modules
import spawn = require('cross-spawn');
import util = require('util');
import path = require('path');
const exec = util.promisify(require('child_process').exec);
import fs = require('fs');

// project modules
import { DatabaseEnv , getSqlConnectionFromNFW } from '../database/sqlAdaptator';
import Log = require('../utils/log');


export class DeployActionClass {

    env: DatabaseEnv;
    mode: string;
    deployDB: boolean;

    constructor( env: DatabaseEnv, mode: string, deployDB: boolean){
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

        const {stdout} = await exec(path.resolve(`./node_modules/.bin/pm2 -v`));
        Log.info(`PM2 local version is ${stdout}`);

        if (this.deployDB) {
            Log.info("connecting to DB ...");
            const connection = await getSqlConnectionFromNFW();
            Log.success('Connected');

            Log.info("Creating dump ...");
            await connection.dumpAll('tmpdb', {
                dumpOptions: {
                    schema: {
                        table : {
                            dropIfExist : false
                        }
                    },
                    tables: ['migration_table'],
                    excludeTables: true,
                    data: false
                }
            });
            Log.success('Done');

            const dumpFile = fs.readFileSync('tmpdb.sql','utf-8');

            Log.info("Creating database on remote host ...");
            await connection.db.query(dumpFile);
            Log.success('Done');
            
            Log.info("Cleaning up temp files ...");
            fs.unlinkSync('tmpdb.sql');
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