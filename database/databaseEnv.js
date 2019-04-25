/**
 * @module databaseEnv
 * @description Parse information from current environment
 * @author Deflorenne Amaury
 */

// node modules
const dotenv = require('dotenv');
const fs = require('fs');

// project modules
const Log = require('../utils/log');

let currentEnv = 'development';

// current env
try {
    let nfwFile = fs.readFileSync(".nfw", 'utf-8');
    let nfwObj = JSON.parse(nfwFile);
    if (nfwObj.env)
        currentEnv = nfwObj.env.toLowerCase();
} catch (e) {
    Log.warning("Failed to read env variable from .nfw file , development has been set by default");
}

dotenv.config({path: `${process.cwd()}/${currentEnv}.env`});
const env = process.env.NODE_ENV;
const type = process.env.TYPEORM_TYPE;
const name = process.env.TYPEORM_NAME;
const port = process.env.TYPEORM_PORT;
const host = process.env.TYPEORM_HOST;
const database = process.env.TYPEORM_DB;
const user = process.env.TYPEORM_USER;
const pwd = process.env.TYPEORM_PWD;

module.exports = {env, type, name, port, host, database, user, pwd};
