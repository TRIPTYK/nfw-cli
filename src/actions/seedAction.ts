// node modules 
import xlsx = require("xlsx");
import fs = require('fs');
import SQLBuilder = require('json-sql-builder2');
const sql = new SQLBuilder('MySQL');
import inquirer = require('inquirer');
import Log = require('../utils/log');
import { getSqlConnectionFromNFW, SqlConnection } from '../database/sqlAdaptator';
// variables
import bcrypt = require('bcryptjs');
let dropData;
let seedExtension;
let pathSeedRead;
let pathSeedWrite;
let seedMethode;
let tableArray = [];

// 1) connexion à la bdd puis requete sql pour les champs colonne / type
// 2) formatage correcte pour le json + xlsx 
// 3) écriture du fichier json 
// 4) écriture xlsx 
// 5) connection finie
export async function main() {
    await inquirer.prompt([{
            type: 'list',
            message: ' choissisez la méthode de seed :    ? ',
            name: 'methode',
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
                default: 'seed',
                name: 'path',
            },
        ])
        .then(answers => {
            dropData = answers.dropData;
            seedExtension = answers.seedExtension;
            pathSeedWrite = answers.path;
        });
}

/**
 * liste toutes les tables de la db 
 * les push dans un tableau en excluant la tables de migrations
 */
async function howMuchTable() {

    const sqlConnection = await getSqlConnectionFromNFW();
    sqlConnection.connect();
    let result = await sqlConnection.db.query(`SHOW TABLES`);

    for (let i = 0; i < result.length; i++) {
        if (Object.values(result[i])[0] === 'migration_table') {} else {
            tableArray.push(Object.values(result[i])[0]);
        }
    }
}

function query(tableData: string, j: number, keyObject: string[], i: number, sqlConnection: SqlConnection, table: any, tabProp: any, dataValues: any) {
    const myQuery = sql.$insert({
        $table: table,
        $columns: tabProp,
        $values: dataValues
    });
    sqlConnection.db.query(myQuery, function (err) {
        if (err) {
            Log.error("Error on your seed");
            process.exit(0);
        };
        if (!err && i == keyObject.length - 1 && j == tableData.length - 1) {
            Log.success("write done");
            process.exit(0);
        }
    });



}
async function writeDb(pathSeedWrite: string, seedExtension: string, dropData: boolean) {

    const sqlConnection = await getSqlConnectionFromNFW();
    sqlConnection.connect();


     /**
      * 1ere lecteure avec fs pour s'assurer que le fichier existe
      * pour le json on lit le fichier, on parse tout dans un objet, on récupère ses keys dans un tableau
      * pour l'xlsx on lit le fichier, puis on ajoute les feuilles du fichier dans un objet 
      * on écrit le tout dans un json 
      * puis on lit le json et on écrit dans la bdd
      */
    switch (seedExtension) {
        case 'json':
            fs.readFile(pathSeedWrite + '.json', (err, data) => {
                
                if (err) {
                    console.log("il semblerait que votre fichier " +pathSeedWrite+".json n'existe pas" );
                    process.exit(0) ; 
                }
                else {
                    var obj = JSON.parse(data.toString());
                let keyObject = Object.keys(obj);

                let tableData;

                for (let i = 0; i < keyObject.length; i++) {
                    tableData = obj[keyObject[i]];
                    let table = keyObject[i];
                    let sql1 = `TRUNCATE TABLE ${table}`;
                    if (dropData == true) {
                        sqlConnection.db.query(sql1, function (err, results) {
                            if (err) {
                                throw err;
                            }
                        })
                    }
                    for (let j = 0; j < tableData.length; j++) {
                        let tabProp = Object.keys(tableData[j]);
                        let dataValues = Object.values(tableData[j]);
                        for (let x = 0; x < tabProp.length; x++) {
                            if (tabProp[x] == "password") {
                                let hash = bcrypt.hashSync(dataValues[x].toString(), 10);
                                dataValues[x] = hash;
                            }
                        }
                        query(tableData, j, keyObject, i, sqlConnection, table, tabProp, dataValues)
                    }
                }

                }
                
                
            });

            break;
        case 'xlsx':
            
                fs.readFile(pathSeedWrite + '.xlsx', (err, data) => {
                    if (err) {
                        console.log("il semblerait que votre fichier " +pathSeedWrite+".xlsx n'existe pas" );
                        process.exit(0) ; 
                    }
                    else {
                        let wb = xlsx.readFile(pathSeedWrite + '.xlsx', {
                            cellDates: true
                        });
                        var result = {};
                        wb.SheetNames.forEach(function (sheetName) {
                            var roa = xlsx.utils.sheet_to_json(wb.Sheets[sheetName]);
                            if (roa.length > 0) {
                                result[sheetName] = roa;
                            }
                        });
                        fs.writeFile(pathSeedWrite + '.json', (JSON.stringify(result, null, 4)), function (err) {
                            if (err) throw err;
                        });
                        fs.readFile(pathSeedWrite + '.json', (err, data) => {
                            // on lit le fichier, on parse tout dans un objet, on récupère ses keys dans un tableau
                            var obj = JSON.parse(data.toString());
                            let keyObject = Object.keys(obj);
            
                            let tableData;
                            for (let i = 0; i < keyObject.length; i++) {
                                tableData = obj[keyObject[i]];
                                let table = keyObject[i];
                                let sql1 = `TRUNCATE TABLE ${table}`;
                                if (dropData == true) {
                                    sqlConnection.db.query(sql1, function (err, results) {
                                        if (err) {
                                            throw err;
                                        }
                                    })
                                }
                                for (let j = 0; j < tableData.length; j++) {
            
                                    let tabProp = Object.keys(tableData[j]);
                                    let dataValues = Object.values(tableData[j]);
            
            
                                    for (let x = 0; x < tabProp.length; x++) {
                                        if (tabProp[x] == "password") {
                                            let hash = bcrypt.hashSync(dataValues[x].toString(), 10);
                                            dataValues[x] = hash;
                                        }
                                    }
                                    query(tableData, j, keyObject, i, sqlConnection, table, tabProp, dataValues)
                                }
                            }
                        });
                    }
                });
            
            break;
    }

}


async function seedWriteFileJson(pathSeedRead: string, objetDb) {
    await fs.writeFile(pathSeedRead + ".json", (JSON.stringify(objetDb, null, 4)), function (err) {
        if (err) throw err;
        Log.success("read done");
        process.exit(0);
    });
}
async function seedWriteFileXlsx(newWB, pathSeedRead) {
    await xlsx.writeFile(newWB, pathSeedRead + ".xlsx");
}
async function readbdd(seedExtension: string, pathSeedRead: string) {

    const sqlConnection = await getSqlConnectionFromNFW();
    sqlConnection.connect();
    let database = sqlConnection.environement.TYPEORM_DB;
    let objetDb = {};
    let newWB = xlsx.utils.book_new();


    for (let i = 0; i < tableArray.length; i++) {
        let tableSql = tableArray[i];
        //console.log("table sql ? " + tableSql);
        let sql2 = `SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'${tableSql}' and TABLE_SCHEMA = '${database}'`;

        //let sql2 = `select * from ${tableSql}`;
        sqlConnection.db.query(sql2, function (err, results: any) {
            let jsonOut = [];

            let keys: {id: number | string, createdAt: any, updatedAt: any, deletedAt: any, avatarId: number | string} = {
                id: null,
                createdAt: '',
                updatedAt: '',
                deletedAt: '',
                avatarId: null
            };

            for (let j = 0; j < results.length; j++) {

                // supprime les colonnes inutiles

                let key = results[j].COLUMN_NAME;
                let type = results[j].COLUMN_TYPE
                keys[key] = '';
                delete keys.id;
                delete keys.createdAt;
                delete keys.updatedAt;
                delete keys.deletedAt;
                delete keys.avatarId;
            }

            jsonOut.push(keys);
            objetDb[tableSql] = jsonOut;

            switch (seedExtension) {
                case 'json':
                    if (i == tableArray.length - 1) {
                        objetDb[tableSql] = jsonOut;

                        seedWriteFileJson(pathSeedRead, objetDb);
                    }
                    break;

                case 'xlsx':

                    let newWS = xlsx.utils.json_to_sheet(jsonOut);
                    xlsx.utils.book_append_sheet(newWB, newWS, tableSql);
                    if (i == tableArray.length - 1) {
                        seedWriteFileXlsx(newWB, pathSeedRead);
                        seedWriteFileJson(pathSeedRead, objetDb);
                    }
                    break;
            }
        });
    }

}