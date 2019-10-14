// node modules
const spawn = require('cross-spawn');
const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);
const fs = require('fs');

// project modules
const { DatabaseEnv , getSqlConnectionFromNFW } = require('../database/sqlAdaptator');
const Log = require('../utils/log');


/**
 *
 * @param env
 * @param mode
 * @returns {Promise<void>}
 */
module.exports = async(env,mode,deployDB) => {
    const loadedEnv = new DatabaseEnv();
    loadedEnv.loadFromFile(env + '.env');

    const { deploy } = require(process.cwd() + "/ecosystem.config");

    if (!deploy.hasOwnProperty(env)) {
        throw new Error(`${env} environment does not exists`);
    }

    const {stdout} = await exec(path.resolve(`./node_modules/.bin/pm2 -v`));
    Log.info(`PM2 local version is ${stdout}`);

    if (deployDB) {
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
        await connection.query(dumpFile);
        Log.success('Done');
        
        Log.info("Cleaning up temp files ...");
        fs.unlinkSync('tmpdb.sql');
    }


    if (mode === 'setup') {
        spawn.sync(`./node_modules/.bin/pm2 deploy ${env} setup`, [], { stdio: 'inherit' , shell : true });
    }else if (mode === 'update') {
        spawn.sync(`./node_modules/.bin/pm2 deploy ${env} update`, [], { stdio: 'inherit' , shell : true });
    }else if (mode === 'revert') {
        spawn.sync(`./node_modules/.bin/pm2 deploy ${env} revert 1`, [], { stdio: 'inherit' , shell : true });
    }else{
        Log.warning("No action specified");
        process.exit(0);
    }
};