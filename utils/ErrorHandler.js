/**
 * @module ErrorHandler
 * @exports migrateRunFail
 * @exports deleteMigrateErr
 */
const operatingSystem = process.platform;
const fs = require('fs');
const  sql = require('../generate/database/sqlAdaptator');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const chalk = require('chalk');


exports.migrateRunFail = async () =>{
    let files = fs.readdirSync('./dist/migration/');
    let regex = RegExp('[^0-9]+');
    let migrationDone = [];
    let migration = await sql.Select(['timestamp','name'],'migration_table');
    console.log(chalk.red("Please check your model then run nfw migrate"));
    migration.forEach(mig => {
      let migName = regex.exec(mig.name);
      let migDone = mig.timestamp+"-"+migName[0]+".js";
        migrationDone.push(migDone);
    });
    files.forEach(file =>{
        if (!migrationDone.includes(file) && file !== 'dump')operatingSystem === 'win32'  ? exec(`DEL /Q /S dist\\migration\\${file}`) : exec(`rm -rf ./dist/migration/${file}`);
    })  


exports.deleteMigrateErr = (err) =>{
    console.log("Could not delete non-compiled migration because :"+err.message);
}}