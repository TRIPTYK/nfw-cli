/**
 * @module generateAction
 * @description Generate a Typeorm entity from questions
 * @author Verliefden Romain
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function () { if (t[0] & 1)
            throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f)
            throw new TypeError("Generator is already executing.");
        while (_)
            try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
                    return t;
                if (y = 0, t)
                    op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0:
                    case 1:
                        t = op;
                        break;
                    case 4:
                        _.label++;
                        return { value: op[1], done: false };
                    case 5:
                        _.label++;
                        y = op[1];
                        op = [0];
                        continue;
                    case 7:
                        op = _.ops.pop();
                        _.trys.pop();
                        continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                            _ = 0;
                            continue;
                        }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                            _.label = op[1];
                            break;
                        }
                        if (op[0] === 6 && _.label < t[1]) {
                            _.label = t[1];
                            t = op;
                            break;
                        }
                        if (t && _.label < t[2]) {
                            _.label = t[2];
                            _.ops.push(op);
                            break;
                        }
                        if (t[2])
                            _.ops.pop();
                        _.trys.pop();
                        continue;
                }
                op = body.call(thisArg, _);
            }
            catch (e) {
                op = [6, e];
                y = 0;
            }
            finally {
                f = t = 0;
            }
        if (op[0] & 5)
            throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
// node modules
var Spinner = require('clui').Spinner;
var chalk = require('chalk');
// project modules
var modelWriteAction = require('./writeModelAction');
var utils = require('./lib/utils');
var inquirer = require('../utils/inquirer');
var createRelationAction = require('./createRelationAction');
var modelSpecs = require('./lib/modelSpecs');
var generateEntityFiles = require('./lib/generateEntityFiles');
var Log = require('../utils/log');
var format = require('../actions/lib/utils').format;
var getSqlConnectionFromNFW = require('../database/sqlAdaptator').getSqlConnectionFromNFW;
/**
 * Main function
 * @param modelName
 * @param crud
 * @param part
 * @returns {Promise<void>}
 */
module.exports = function (modelName, crud, part) {
    if (part === void 0) {
        part = null;
    }
    return __awaiter(_this, void 0, void 0, function () {
        var modelExists, sqlConnection, confirmation, spinner, isExisting, entityModelData, data, _a, _b, columns, foreignKeys, j, _loop_1, i;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    modelName = format(modelName);
                    return [4 /*yield*/, utils.modelFileExists(modelName)];
                case 1:
                    modelExists = _c.sent();
                    return [4 /*yield*/, getSqlConnectionFromNFW()];
                case 2:
                    sqlConnection = _c.sent();
                    if (!modelExists)
                        return [3 /*break*/, 4];
                    return [4 /*yield*/, inquirer.askForConfirmation(chalk.magenta(modelName) + " already exists, will you overwrite it ?")];
                case 3:
                    confirmation = (_c.sent()).confirmation;
                    if (!confirmation) {
                        Log.error('/!\\ Process Aborted /!\\');
                        process.exit(0);
                    }
                    _c.label = 4;
                case 4:
                    spinner = new Spinner("Checking for existing entities ....");
                    spinner.start();
                    return [4 /*yield*/, sqlConnection.tableExists(modelName)];
                case 5:
                    isExisting = _c.sent();
                    spinner.stop();
                    entityModelData = null;
                    return [4 /*yield*/, inquirer.askForChoice(isExisting)];
                case 6:
                    data = _c.sent();
                    _a = data.value;
                    switch (_a) {
                        case "create an entity": return [3 /*break*/, 7];
                        case "create empty entity": return [3 /*break*/, 11];
                        case "nothing": return [3 /*break*/, 14];
                        case 'create from db': return [3 /*break*/, 15];
                    }
                    return [3 /*break*/, 23];
                case 7: return [4 /*yield*/, modelSpecs.dbParams(modelName)];
                case 8:
                    entityModelData = _c.sent();
                    if (!(!part || part === "model"))
                        return [3 /*break*/, 10];
                    return [4 /*yield*/, modelWriteAction.writeModel(modelName, entityModelData)
                            .catch(function (e) {
                            console.log(e);
                            Log.error("Failed to generate model : " + e.message + "\nExiting ...");
                            process.exit(1);
                        })];
                case 9:
                    _c.sent();
                    _c.label = 10;
                case 10: return [3 /*break*/, 23];
                case 11:
                    if (!(!part || part === "model"))
                        return [3 /*break*/, 13];
                    return [4 /*yield*/, modelWriteAction.basicModel(modelName)
                            .catch(function (e) {
                            Log.error("Failed to generate model : " + e.message + "\nExiting ...");
                            process.exit(1);
                        })];
                case 12:
                    _c.sent();
                    _c.label = 13;
                case 13:
                    entityModelData = [];
                    entityModelData['columns'] = [];
                    entityModelData['foreignKeys'] = [];
                    entityModelData['createUpdate'] = {
                        createAt: true,
                        updateAt: true
                    };
                    return [3 /*break*/, 23];
                case 14:
                    console.log(chalk.bgRed(chalk.black(" /!\\ Process aborted /!\\")));
                    process.exit(0);
                    return [3 /*break*/, 23];
                case 15: return [4 /*yield*/, sqlConnection.getTableInfo(modelName)];
                case 16:
                    _b = _c.sent(), columns = _b.columns, foreignKeys = _b.foreignKeys;
                    for (j = 0; j < columns.length; j++) {
                        columns[j].Type = utils.sqlTypeData(columns[j].Type);
                    }
                    entityModelData = { columns: columns, foreignKeys: foreignKeys };
                    if (!(!part || part === "model"))
                        return [3 /*break*/, 18];
                    return [4 /*yield*/, modelWriteAction.writeModel(modelName, entityModelData)
                            .catch(function (e) {
                            Log.error("Failed to generate model : " + e.message + "\nExiting ...");
                            process.exit(1);
                        })];
                case 17:
                    _c.sent();
                    _c.label = 18;
                case 18:
                    if (!(foreignKeys && foreignKeys.length))
                        return [3 /*break*/, 22];
                    _loop_1 = function (i) {
                        var tmpKey, response, _a, m1Name, m2Name;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    tmpKey = foreignKeys[i];
                                    return [4 /*yield*/, inquirer.askForeignKeyRelation(tmpKey)];
                                case 1:
                                    response = (_b.sent()).response;
                                    return [4 /*yield*/, inquirer.questionM1M2(tmpKey.TABLE_NAME, tmpKey.REFERENCED_TABLE_NAME)];
                                case 2:
                                    _a = _b.sent(), m1Name = _a.m1Name, m2Name = _a.m2Name;
                                    return [4 /*yield*/, createRelationAction(tmpKey.TABLE_NAME, tmpKey.REFERENCED_TABLE_NAME, response, tmpKey.COLUMN_NAME, tmpKey.REFERENCED_COLUMN_NAME, m1Name, m2Name)
                                            .then(function () { return Log.success("Relation successfully added !"); })
                                            .catch(function (err) { return Log.error(err.message + "\nFix the issue then run nfw " + response + " " + tmpKey.TABLE_NAME + " " + tmpKey.REFERENCED_TABLE_NAME); })];
                                case 3:
                                    _b.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _c.label = 19;
                case 19:
                    if (!(i < foreignKeys.length))
                        return [3 /*break*/, 22];
                    return [5 /*yield**/, _loop_1(i)];
                case 20:
                    _c.sent();
                    _c.label = 21;
                case 21:
                    i++;
                    return [3 /*break*/, 19];
                case 22: return [3 /*break*/, 23];
                case 23: return [4 /*yield*/, generateEntityFiles(modelName, crud, entityModelData, part)
                        .catch(function (e) {
                        console.log(e);
                        Log.error("Generation failed : " + e + "\nExiting ...");
                        process.exit(1);
                    })];
                case 24:
                    _c.sent();
                    return [2 /*return*/];
            }
        });
    });
};
