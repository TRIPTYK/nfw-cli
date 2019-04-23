/**
 * Node modules
 */
const util = require('util');
const fs = require('fs');
const exec = util.promisify(require('child_process').exec);
const path = require('path');

/**
 * Project modules
 */
const sqlAdaptor = require('../database/sqlAdaptator');

module.exports = async (modelName) => {
    const typeorm_cli = path.resolve('.', 'node_modules', 'typeorm', 'cli.js');
    const ts_node = path.resolve('.', 'node_modules', '.bin', 'ts-node');

    // parse ormconfig.json
    const ormConfig = JSON.parse(fs.readFileSync(`${process.cwd()}/ormconfig.json`, 'utf-8'));

    // check if field cli exists
    if (!ormConfig.cli)
        throw new Error("Please check the cli:migrationDir field in ormconfig.json");

    const outputPath = ormConfig.cli.migrationsDir;

    await exec(`${ts_node} ${typeorm_cli} migration:generate -n ${modelName}`);

    await exec(`${ts_node} ${typeorm_cli}  migration:run`)
        .catch(async e => { //Handle delete failed migration
            let files = fs.readdirSync('./src/migration/');
            let regex = /[^0-9]+/;
            let migration = await sqlAdaptor.select(['timestamp', 'name'], 'migration_table');

            let migrationFiles = migration.map(mig => {
                let migName = regex.exec(mig.name);
                return `${mig.timestamp}-${migName[0]}.js`;
            });

            files.forEach(file => {
                if (!migrationFiles.includes(file) && file !== 'dump')
                    fs.unlinkSync(`./src/migration/${file}`);
            });

            throw new Error(`Failed to execute migration : ${e.message}`); // throw error again
        });

    return [outputPath]; // return migration output path
};