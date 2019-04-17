/**
 * @module ErrorHandler
 * @exports migrateRunFail
 * @exports deleteMigrateErr
 */
const fs = require('fs');
const Log = require('../utils/log');

const sql = require('../database/sqlAdaptator');

exports.migrateRunFail = async () => {
    let files = fs.readdirSync('./dist/migration/');
    let regex = /[^0-9]+/;
    let migration = await sql.select(['timestamp', 'name'], 'migration_table');

    Log.error("Please check your model then run nfw migrate");

    let migrationFiles = migration.map(mig => {
        let migName = regex.exec(mig.name);
        return `${mig.timestamp}-${migName[0]}.js`;
    });
    files.forEach(file => {
        if (!migrationFiles.includes(file) && file !== 'dump')
            fs.unlinkSync(`./dist/migration/${file}`);
    });
};


exports.deleteMigrateErr = (err) => {
    console.log("Could not delete non-compiled migration because :" + err.message);
};
