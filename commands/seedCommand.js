// node modules 
const xlsx = require("xlsx");
const fs = require('fs');
const mysql = require('mysql');
const SQLBuilder = require('json-sql-builder2');
const sql = new SQLBuilder('MySQL');
const inquirer = require('inquirer');
const commandUtils = require('./commandUtils');
const Log = require('../utils/log');
const readAction = require('../actions/removeRelationAction');

const {
    getSqlConnectionFromNFW
} = require('../database/sqlAdaptator');

let dropData;
let seedExtension;
let pathSeedRead;
let pathSeedWrite;
let seedMethode;
let tableArray = [];
let tableTotal = 1;
// variables



// 1) connexion à la bdd puis requete sql pour les champs colonne / type
// 2) formatage correcte pour le json + xlsx 
// 3) écriture du fichier json 
// 4) écriture xlsx 
// 5) connection finie

/**
 * Yargs command syntax
 * @type {string}
 */

exports.command = 'seed';
/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'seed a file into database';

/**
 *  Yargs command builder
 */

exports.builder = () => {

};




/**
 * Main function
 * 
 * @return {Promise<void>}
 */
exports.handler = async () => {
    await main();
    



}




async function main() {
    await inquirer.prompt([{
            type: 'list',
            message: ' choissisez le format de l\'extension de votre fichier de seed  ? ',
            name: 'methode',
            //choices: ['lecture', 'ecriture', 'lecture + ecriture'] buggued lect + ecriture
            choices: ['lecture', 'ecriture']
        }, ])
        .then(answers => {
            seedMethode = answers.methode;
        })

    switch (seedMethode) {
        case 'lecture':
            await readInquire();
            await howMuchTable();
            await readbdd(seedExtension, pathSeedRead);
            
            break;
        case 'ecriture':
            await writeInquire();
            await writeDb(pathSeedWrite, seedExtension, dropData).then(()=>{
                
            });
            break;
        case 'lecture + ecriture':
            await readInquire();
            await readbdd(seedExtension, pathSeedRead);
            //await console.log("remplissez vos fichier json / excel");
            await writeInquire();
            await writeDb(pathSeedWrite, seedExtension, dropData);
            break;
    }
    
}
async function readInquire() {
    await
    inquirer
        .prompt([{
                type: 'list',
                message: ' choissisez le format de l\'extension de votre fichier de seed  ? ',
                name: 'seedExtension',
                choices: ['json', 'xlsx']
            },
            {
                type: 'input',
                message: ' chemin du fichier  ? ',
                default: 'seed',
                name: 'path',
            },
        ])
        .then(answers => {
            seedExtension = answers.seedExtension;
            pathSeedRead = answers.path;
        });
}
async function writeInquire() {
    await inquirer
        .prompt([{
                type: 'confirm',
                message: ' delete les datas de la table  ? ',
                default: true,
                name: 'dropData',
            },
            {
                type: 'list',
                message: ' choissisez le format de l\'extension de votre fichier de seed  ? ',
                name: 'seedExtension',
                choices: ['json', 'xlsx']
            },
            {
                type: 'input',
                message: ' chemin du fichier  ? ',
                default: 'seedBddAvecDonne',
                name: 'path',
            },
        ])
        .then(answers => {
            dropData = answers.dropData;
            seedExtension = answers.seedExtension;
            pathSeedWrite = answers.path;
        });
}
async function howMuchTable() {

    for (let i = 0; i < tableTotal; i++) {
        if (i == 0) {
            await
            inquirer
                .prompt([{
                    type: 'input',
                    message: ' combien de table ? ',
                    default: 1,
                    name: 'tableTotal',
                }])
                .then(answers => {
                    tableTotal = answers.tableTotal;
                });
        }
        await
        inquirer
            .prompt([{
                type: 'input',
                message: ' table ? ',
                default: 'user',
                name: 'tableName',
            }])
            .then(answers => {
                tableArray[i] = answers.tableName;
            });
    }
}
async function writeDb(pathSeedWrite, seedExtension, dropData) {
    const sqlConnection = await getSqlConnectionFromNFW();
    sqlConnection.connect();
    let database = sqlConnection.environement.TYPEORM_DB ;
        console.log(database);

        switch (seedExtension) {
            case 'json':
                fs.readFile(pathSeedWrite + '.json', (err, data) => {
                    // on lit le fichier, on parse tout dans un objet, on récupère ses keys dans un tableau

                    var obj = JSON.parse(data);
                    let keyObject = Object.keys(obj);

                    let tableData;
                    for (i = 0; i < keyObject.length; i++) {
                        tableData = obj[keyObject[i]];
                        let table = keyObject[i];
                        let sql1 = `TRUNCATE TABLE ${table}`;
                        if (dropData == true) {
                            sqlConnection.query(sql1, function (err, results) {
                                if (err) {
                                    throw err;
                                }
                            })

                        }
                        for (let j = 0; j < tableData.length; j++) {
                            let tabProp = Object.keys(tableData[j]);
                            let dataValues = Object.values(tableData[j]);

                            myQuery = sql.$insert({
                                $table: table,
                                $columns: tabProp,
                                $values: dataValues
                            });

                            sqlConnection.query(myQuery, function (err, result) {
                                if (err) throw err;
                            });

                        }

                    }
                    
                });

                break;
            case 'xlsx':
                let wb = xlsx.readFile(pathSeedWrite + '.xlsx', {
                    cellDates: true
                });
                var result = {};
                wb.SheetNames.forEach(function (sheetName) {
                    var roa = xlsx.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
                    if (roa.length > 0) {
                        result[sheetName] = roa;
                    }
                });
                fs.writeFile(pathSeedWrite + '.json', (JSON.stringify(result, null, 4)), function (err) {
                    if (err) throw err;
                });

                fs.readFile(pathSeedWrite + '.json', (err, data) => {
                    // on lit le fichier, on parse tout dans un objet, on récupère ses keys dans un tableau

                    var obj = JSON.parse(data);
                    let keyObject = Object.keys(obj);

                    let tableData;

                    for (i = 0; i < keyObject.length; i++) {
                        tableData = obj[keyObject[i]];
                        let table = keyObject[i];
                        let sql1 = `TRUNCATE TABLE ${table}`;
                        if (dropData == true) {
                            sqlConnection.query(sql1, function (err, results) {
                                if (err) {
                                    throw err;
                                }

                            })
                        }
                        for (let j = 0; j < tableData.length; j++) {
                            let tabProp = Object.keys(tableData[j]);
                            let dataValues = Object.values(tableData[j]);

                            myQuery = sql.$insert({
                                $table: table,
                                $columns: tabProp,
                                $values: dataValues
                            });

                            sqlConnection.query(myQuery, function (err, result) {
                                if (err) throw err;


                            });
                        }
                    }
                    
                });
                break;
        }
    
}

async function readbdd(seedExtension, pathSeedRead) {

    const sqlConnection = await getSqlConnectionFromNFW();
    sqlConnection.connect();
    let database = sqlConnection.environement.TYPEORM_DB ;
    let objetDb = {};
    let newWB = xlsx.utils.book_new();
    

        for (let i = 0; i < tableArray.length; i++) {
            let tableSql = tableArray[i];
            //console.log("table sql ? " + tableSql);
            let sql2 = `SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'${tableSql}' and TABLE_SCHEMA = '${database}'`;

            //let sql2 = `select * from ${tableSql}`;
            sqlConnection.query(sql2, function (err, results) {
                console.log(results.length);

                let jsonOut = [];

                let keys = {};
                for (j = 0; j < results.length; j++) {

                    // supprime les colonnes inutiles

                    key = results[j].COLUMN_NAME;
                    type = results[j].COLUMN_TYPE
                    keys[key] = '';
                    delete keys.id;
                    delete keys.createdAt;
                    delete keys.updatedAt;
                    delete keys.deletedAt;
                    delete keys.avatarId;

                }
                jsonOut.push(keys);
                console.log(jsonOut);

                objetDb[tableSql] = jsonOut;
                //console.log(jsonOut);

                let newWS = xlsx.utils.json_to_sheet(jsonOut);
                xlsx.utils.book_append_sheet(newWB, newWS, tableSql);
                switch (seedExtension) {
                    case 'json':
                        if (i == tableArray.length - 1) {
                            objetDb[tableSql] = jsonOut;
                            objetDb[tableSql] = jsonOut;
                            fs.writeFile(pathSeedRead + ".json", (JSON.stringify(objetDb, null, 4)), function (err) {
                                if (err) throw err;
                            });
                            
                        }
                        break;

                    case 'xlsx':
                        if (i == tableArray.length - 1) {
                            xlsx.writeFile(newWB,pathSeedRead + ".xlsx");
                            fs.writeFile(pathSeedRead + ".json", (JSON.stringify(objetDb, null, 4)), function (err) {
                                if (err) throw err;
                            });
                            
                        }
                        break;
                }
            });
            
        }


}