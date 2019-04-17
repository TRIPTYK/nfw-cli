/**
 * Node modules
 */
const util = require('util');
const fs = require('fs');
const chalk = require('chalk');
const rimraf = util.promisify(require('rimraf'));
const exec = util.promisify(require('child_process').exec);
const {Spinner} = require('clui');

/**
 * Project modules
 */
const Log = require('../utils/log');
const sqlAdaptor = require('../database/sqlAdaptator');

module.exports = async (modelName) => {
    const migrate = new Spinner('Generating migration ...');
    migrate.start();

    await exec(`tsc`)
        .then(() => console.log(chalk.green("Compiled successfully")))
        .catch(e => Log.error(`Failed to compile typescript : ${e.message}`));

    await exec(`typeorm migration:generate -n ${modelName}`)
        .then(() => console.log(chalk.green("Migration generated successfully")))
        .catch(e => Log.error(`Failed to generate migration : ${e.message}`));

    await exec(`tsc`)
        .then(() => {
            Log.success("Compiled successfully");
            rimraf('./src/migration').catch((e) => {
                console.log("Could not delete non-compiled migration because :" + e.message);
            });
        })
        .catch(e => Log.error(`Failed to compile typescript : ${e.message}`));

    await exec(`typeorm migration:run`)
        .then(() => console.log(chalk.green("Migration executed successfully")))
        .catch(async e => {
            Log.error(`Failed to execute migration : ${e.message}`);

            let files = fs.readdirSync('./dist/migration/');
            let regex = /[^0-9]+/;
            let migration = await sqlAdaptor.select(['timestamp', 'name'], 'migration_table');

            Log.error("Please check your model then run nfw migrate");

            let migrationFiles = migration.map(mig => {
                let migName = regex.exec(mig.name);
                return `${mig.timestamp}-${migName[0]}.js`;
            });
            files.forEach(file => {
                if (!migrationFiles.includes(file) && file !== 'dump')
                    fs.unlinkSync(`./dist/migration/${file}`);
            });
        });

    migrate.stop();
    process.exit(0);
};