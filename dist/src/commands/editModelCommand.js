/**
 * @module editModelCommand
 * @description Command module to handle editing of a given entity
 * @author Deflorenne Amaury
 */
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
var _this = this;
// Project imports
var commandUtils = require('./commandUtils');
var utils = require('../actions/lib/utils');
var editModelAction = require('../actions/editModelAction');
var Log = require('../utils/log');
var migrate = require('../actions/migrateAction');
var _a = require('../actions/lib/utils'), columnExist = _a.columnExist, format = _a.format;
//Node Modules
var Spinner = require('clui').Spinner;
var chalk = require('chalk');
/**
 * Yargs command
 * @type {string}
 */
exports.command = 'editModel <model> <action> [columnName]';
/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ["em", "edit"];
/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'add or remove column in an existing model\nAction can be either add or remove\ncolumnName is required only for the remove action.';
/**
 * Yargs command builder
 */
exports.builder = function (yargs) {
    yargs.choices('action', ['remove', 'add']);
};
/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = function (argv) { return __awaiter(_this, void 0, void 0, function () {
    var model, columnName, action, spinner;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                model = argv.model, columnName = argv.columnName, action = argv.action;
                model = format(model);
                spinner = new Spinner("Generating and executing migration");
                commandUtils.validateDirectory();
                return [4 /*yield*/, commandUtils.checkVersion()];
            case 1:
                _a.sent();
                return [4 /*yield*/, commandUtils.checkConnectToDatabase()];
            case 2:
                _a.sent();
                if (!utils.modelFileExists(model)) {
                    Log.error("Model should exist in order to edit him");
                    process.exit(0);
                }
                if (!(action === 'remove' && !columnName)) return [3 /*break*/, 3];
                Log.info("you must specify the column to remove");
                return [3 /*break*/, 7];
            case 3:
                if (!(action === 'add')) return [3 /*break*/, 5];
                if (columnName && columnExist(model, columnName)) {
                    Log.error('column already exist');
                    process.exit(0);
                }
                return [4 /*yield*/, editModelAction('add', model, columnName)
                        .then(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    spinner.start();
                                    return [4 /*yield*/, migrate("remove-" + columnName + "-from-" + model)
                                            .then(function (generated) {
                                            var migrationDir = generated[0];
                                            spinner.stop(true);
                                            Log.success("Executed migration successfully");
                                            Log.info("Generated in " + chalk.cyan(migrationDir));
                                        })
                                            .catch(function (e) {
                                            spinner.stop(true);
                                            Log.error(e.message);
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })
                        .catch(function (e) {
                        console.log(e);
                        Log.error('Failed to edit model : ' + e.message);
                    })];
            case 4:
                _a.sent();
                return [3 /*break*/, 7];
            case 5:
                if (!(action === 'remove' && columnName)) return [3 /*break*/, 7];
                return [4 /*yield*/, editModelAction('remove', model, columnName)
                        .then(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    spinner.start();
                                    return [4 /*yield*/, migrate("remove-" + columnName + "-from-" + model)
                                            .then(function (generated) {
                                            var migrationDir = generated[0];
                                            spinner.stop(true);
                                            Log.success("Executed migration successfully");
                                            Log.info("Generated in " + chalk.cyan(migrationDir));
                                        })
                                            .catch(function (e) {
                                            spinner.stop(true);
                                            Log.error(e.message);
                                        })];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); })
                        .catch(function (e) {
                        Log.error('Failed to edit model : ' + e.message);
                    })];
            case 6:
                _a.sent();
                _a.label = 7;
            case 7:
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); };
