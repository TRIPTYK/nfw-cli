const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const path = require('path');
const { DatabaseEnv } = require('../database/sqlAdaptator');
const spawn = require('cross-spawn');

module.exports = async(env,mode) => {
    const loadedEnv = new DatabaseEnv();
    loadedEnv.loadFromFile(env + '.env');

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