/**
 * Node modules
 */
const util = require('util');
const fs = require('fs');
const chalk = require('chalk');
const rimraf = util.promisify(require('rimraf'));
const exec = util.promisify(require('child_process').exec);
const {Spinner} = require('clui');
const path = require('path');

/**
 * Project modules
 */
const Log = require('../utils/log');
const sqlAdaptor = require('../database/sqlAdaptator');

module.exports = async (modelName) => {
    const migrate = new Spinner('Generating migration ...');
    const typeorm_cli = path.resolve('.', 'node_modules', 'typeorm', 'cli.js');
    const ts_node = path.resolve('.', 'node_modules', '.bin', 'ts-node');

    migrate.start();


    await exec(`${ts_node} ${typeorm_cli} migration:generate -n ${modelName}`)
        .then(() => Log.success(chalk.green("Migration generated successfully : " + modelName)))
        .catch(e => Log.error(`Failed to generate migration : ${e.message}`));

    await exec(`${ts_node} ${typeorm_cli}  migration:run`)
        .then(() => Log.success(chalk.green("Migration executed successfully")))
        .catch(async e => {
            Log.error(`Failed to execute migration : ${e.message}`);

            let files = fs.readdirSync('./src/migration/');
            let regex = /[^0-9]+/;
            let migration = await sqlAdaptor.select(['timestamp', 'name'], 'migration_table');

            Log.error("Please check your model then run nfw migrate");

            let migrationFiles = migration.map(mig => {
                let migName = regex.exec(mig.name);
                return `${mig.timestamp}-${migName[0]}.js`;
            });
            files.forEach(file => {
                if (!migrationFiles.includes(file) && file !== 'dump')
                    fs.unlinkSync(`./src/migration/${file}`);
            });
        });

    migrate.stop();
    process.exit(0);
};