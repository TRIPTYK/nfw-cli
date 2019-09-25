// node modules
const spawn = require('cross-spawn');
const util = require('util');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

// project modules
const { DatabaseEnv } = require('../database/sqlAdaptator');

/**
 *
 * @param env
 * @param mode
 * @returns {Promise<void>}
 */
module.exports = async(env,mode) => {
    const loadedEnv = new DatabaseEnv();
    loadedEnv.loadFromFile(env + '.env');

    const { deploy } = require(process.cwd() + "/ecosystem.config");

    if (!deploy.hasOwnProperty(env)) {
        throw new Error(`${env} environment does not exists`);
    }

    const {stdout} = await exec(path.resolve(`./node_modules/.bin/pm2 -v`));
    console.log(`PM2 local version is ${stdout}`);

    if (mode === 'setup') {
        spawn.sync(`./node_modules/.bin/pm2 deploy ${env} setup`, [], { stdio: 'inherit' });
    }

    if (mode === 'update') {
        spawn.sync(`./node_modules/.bin/pm2 deploy ${env} update`, [], { stdio: 'inherit' });
    }

    if (mode === 'revert') {
        spawn.sync(`./node_modules/.bin/pm2 deploy ${env} revert 1`, [], { stdio: 'inherit' });
    }
};