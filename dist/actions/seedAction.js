"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// node modules 
var xlsx = require("xlsx");
var fs = require("fs");
var SQLBuilder = require("json-sql-builder2");
var sql = new SQLBuilder('MySQL');
var inquirer = require("inquirer");
var Log = require("../utils/log");
var sqlAdaptator_1 = require("../database/sqlAdaptator");
// variables
var bcrypt = require("bcryptjs");
var dropData;
var seedExtension;
var pathSeedRead;
var pathSeedWrite;
var seedMethode;
var tableArray = [];
// 1) connexion à la bdd puis requete sql pour les champs colonne / type
// 2) formatage correcte pour le json + xlsx 
// 3) écriture du fichier json 
// 4) écriture xlsx 
// 5) connection finie
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, inquirer.prompt([{
                            type: 'list',
                            message: ' choissisez la méthode de seed :    ? ',
                            name: 'methode',
                            choices: ['lecture', 'ecriture']
                        },])
                        .then(function (answers) {
                        seedMethode = answers.methode;
                    })];
                case 1:
                    _b.sent();
                    _a = seedMethode;
                    switch (_a) {
                        case 'lecture': return [3 /*break*/, 2];
                        case 'ecriture': return [3 /*break*/, 6];
                    }
                    return [3 /*break*/, 9];
                case 2: return [4 /*yield*/, readInquire()];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, howMuchTable()];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, readbdd(seedExtension, pathSeedRead)];
                case 5:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 6: return [4 /*yield*/, writeInquire()];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, writeDb(pathSeedWrite, seedExtension, dropData)];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.main = main;
function readInquire() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer
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
                        .then(function (answers) {
                        seedExtension = answers.seedExtension;
                        pathSeedRead = answers.path;
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function writeInquire() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, inquirer
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
                        .then(function (answers) {
                        dropData = answers.dropData;
                        seedExtension = answers.seedExtension;
                        pathSeedWrite = answers.path;
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * liste toutes les tables de la db
 * les push dans un tableau en excluant la tables de migrations
 */
function howMuchTable() {
    return __awaiter(this, void 0, void 0, function () {
        var sqlConnection, result, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sqlAdaptator_1.getSqlConnectionFromNFW()];
                case 1:
                    sqlConnection = _a.sent();
                    sqlConnection.connect();
                    return [4 /*yield*/, sqlConnection.db.query("SHOW TABLES")];
                case 2:
                    result = _a.sent();
                    for (i = 0; i < result.length; i++) {
                        if (Object.values(result[i])[0] === 'migration_table') { }
                        else {
                            tableArray.push(Object.values(result[i])[0]);
                        }
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function query(tableData, j, keyObject, i, sqlConnection, table, tabProp, dataValues) {
    var myQuery = sql.$insert({
        $table: table,
        $columns: tabProp,
        $values: dataValues
    });
    sqlConnection.db.query(myQuery, function (err) {
        if (err) {
            Log.error("Error on your seed");
            process.exit(0);
        }
        ;
        if (!err && i == keyObject.length - 1 && j == tableData.length - 1) {
            Log.success("write done");
            process.exit(0);
        }
    });
}
function writeDb(pathSeedWrite, seedExtension, dropData) {
    return __awaiter(this, void 0, void 0, function () {
        var sqlConnection;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sqlAdaptator_1.getSqlConnectionFromNFW()];
                case 1:
                    sqlConnection = _a.sent();
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
                            fs.readFile(pathSeedWrite + '.json', function (err, data) {
                                if (err) {
                                    console.log("il semblerait que votre fichier " + pathSeedWrite + ".json n'existe pas");
                                    process.exit(0);
                                }
                                else {
                                    var obj = JSON.parse(data.toString());
                                    var keyObject = Object.keys(obj);
                                    var tableData = void 0;
                                    for (var i = 0; i < keyObject.length; i++) {
                                        tableData = obj[keyObject[i]];
                                        var table = keyObject[i];
                                        var sql1 = "TRUNCATE TABLE " + table;
                                        if (dropData == true) {
                                            sqlConnection.db.query(sql1, function (err, results) {
                                                if (err) {
                                                    throw err;
                                                }
                                            });
                                        }
                                        for (var j = 0; j < tableData.length; j++) {
                                            var tabProp = Object.keys(tableData[j]);
                                            var dataValues = Object.values(tableData[j]);
                                            for (var x = 0; x < tabProp.length; x++) {
                                                if (tabProp[x] == "password") {
                                                    var hash = bcrypt.hashSync(dataValues[x].toString(), 10);
                                                    dataValues[x] = hash;
                                                }
                                            }
                                            query(tableData, j, keyObject, i, sqlConnection, table, tabProp, dataValues);
                                        }
                                    }
                                }
                            });
                            break;
                        case 'xlsx':
                            fs.readFile(pathSeedWrite + '.xlsx', function (err, data) {
                                if (err) {
                                    console.log("il semblerait que votre fichier " + pathSeedWrite + ".xlsx n'existe pas");
                                    process.exit(0);
                                }
                                else {
                                    var wb_1 = xlsx.readFile(pathSeedWrite + '.xlsx', {
                                        cellDates: true
                                    });
                                    var result = {};
                                    wb_1.SheetNames.forEach(function (sheetName) {
                                        var roa = xlsx.utils.sheet_to_json(wb_1.Sheets[sheetName]);
                                        if (roa.length > 0) {
                                            result[sheetName] = roa;
                                        }
                                    });
                                    fs.writeFile(pathSeedWrite + '.json', (JSON.stringify(result, null, 4)), function (err) {
                                        if (err)
                                            throw err;
                                    });
                                    fs.readFile(pathSeedWrite + '.json', function (err, data) {
                                        // on lit le fichier, on parse tout dans un objet, on récupère ses keys dans un tableau
                                        var obj = JSON.parse(data.toString());
                                        var keyObject = Object.keys(obj);
                                        var tableData;
                                        for (var i = 0; i < keyObject.length; i++) {
                                            tableData = obj[keyObject[i]];
                                            var table = keyObject[i];
                                            var sql1 = "TRUNCATE TABLE " + table;
                                            if (dropData == true) {
                                                sqlConnection.db.query(sql1, function (err, results) {
                                                    if (err) {
                                                        throw err;
                                                    }
                                                });
                                            }
                                            for (var j = 0; j < tableData.length; j++) {
                                                var tabProp = Object.keys(tableData[j]);
                                                var dataValues = Object.values(tableData[j]);
                                                for (var x = 0; x < tabProp.length; x++) {
                                                    if (tabProp[x] == "password") {
                                                        var hash = bcrypt.hashSync(dataValues[x].toString(), 10);
                                                        dataValues[x] = hash;
                                                    }
                                                }
                                                query(tableData, j, keyObject, i, sqlConnection, table, tabProp, dataValues);
                                            }
                                        }
                                    });
                                }
                            });
                            break;
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function seedWriteFileJson(pathSeedRead, objetDb) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fs.writeFile(pathSeedRead + ".json", (JSON.stringify(objetDb, null, 4)), function (err) {
                        if (err)
                            throw err;
                        Log.success("read done");
                        process.exit(0);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function seedWriteFileXlsx(newWB, pathSeedRead) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, xlsx.writeFile(newWB, pathSeedRead + ".xlsx")];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function readbdd(seedExtension, pathSeedRead) {
    return __awaiter(this, void 0, void 0, function () {
        var sqlConnection, database, objetDb, newWB, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, sqlAdaptator_1.getSqlConnectionFromNFW()];
                case 1:
                    sqlConnection = _a.sent();
                    sqlConnection.connect();
                    database = sqlConnection.environement.TYPEORM_DB;
                    objetDb = {};
                    newWB = xlsx.utils.book_new();
                    _loop_1 = function (i) {
                        var tableSql = tableArray[i];
                        //console.log("table sql ? " + tableSql);
                        var sql2 = "SELECT COLUMN_NAME, COLUMN_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'" + tableSql + "' and TABLE_SCHEMA = '" + database + "'";
                        //let sql2 = `select * from ${tableSql}`;
                        sqlConnection.db.query(sql2, function (err, results) {
                            var jsonOut = [];
                            var keys = {
                                id: null,
                                createdAt: '',
                                updatedAt: '',
                                deletedAt: '',
                                avatarId: null
                            };
                            for (var j = 0; j < results.length; j++) {
                                // supprime les colonnes inutiles
                                var key = results[j].COLUMN_NAME;
                                var type = results[j].COLUMN_TYPE;
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
                                    var newWS = xlsx.utils.json_to_sheet(jsonOut);
                                    xlsx.utils.book_append_sheet(newWB, newWS, tableSql);
                                    if (i == tableArray.length - 1) {
                                        seedWriteFileXlsx(newWB, pathSeedRead);
                                        seedWriteFileJson(pathSeedRead, objetDb);
                                    }
                                    break;
                            }
                        });
                    };
                    for (i = 0; i < tableArray.length; i++) {
                        _loop_1(i);
                    }
                    return [2 /*return*/];
            }
        });
    });
}
