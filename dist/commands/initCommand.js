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
/**
 * @module initCommand
 * @description Command module to create a database, execute migration and create a super user
 * @author Antoine Samuel
 */
// Project imports
var commandUtils = require("../commands/commandUtils");
var Log = require("../utils/log");
var actionUtils = require("../actions/lib/utils");
var migrateAction = require("../actions/migrateAction");
var createSuperUserAction = require("../actions/createSuperUserAction");
var DatabaseSingleton_1 = require("../utils/DatabaseSingleton");
//Node_modules import
var fs = require("fs");
var chalk_1 = require("chalk");
var clui_1 = require("clui");
//Yargs command
exports.command = 'initialize';
//Yargs command aliases
exports.aliases = ['init'];
//Yargs command description
exports.describe = 'Create a database if not existing, add tables and creates a super user';
//Yargs command builder
function builder(yargs) {
    yargs.option('env', {
        desc: "Allow user to chose which environement to use",
        type: "string",
        default: 'development'
    });
}
exports.builder = builder;
;
/**
 * Main function
 * @return {void}
 */
function handler(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var files, strategyInstance, databaseStrategy, envFiles, spinner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commandUtils.validateDirectory();
                    files = fs.readdirSync('./');
                    strategyInstance = DatabaseSingleton_1.Singleton.getInstance();
                    databaseStrategy = strategyInstance.setDatabaseStrategy();
                    envFiles = files.filter(function (file) { return file.includes('.env'); }).map(function (fileName) { return fileName.substr(0, fileName.lastIndexOf('.')); });
                    if (!envFiles.includes(argv.env)) {
                        Log.error("Error: " + argv.env + " is not found, available environment are : " + envFiles);
                        process.exit(0);
                    }
                    return [4 /*yield*/, actionUtils.createDataBaseIfNotExists(argv.env)];
                case 1:
                    _a.sent();
                    spinner = new clui_1.Spinner("Generating and executing migration");
                    spinner.start();
                    return [4 /*yield*/, new migrateAction.MigrateActionClass(databaseStrategy, "init").main()
                            .then(function (generated) {
                            var migrationDir = generated[0];
                            spinner.stop();
                            Log.success("Executed migration successfully");
                            Log.info("Generated in " + chalk_1.default.cyan(migrationDir));
                        })
                            .catch(function (e) {
                            spinner.stop();
                            Log.error(e.message);
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, commandUtils.checkConnectToDatabase(databaseStrategy)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, new createSuperUserAction.CreateSuperUserActionClass(databaseStrategy, "admin").main()
                            .then(function (generated) {
                            var filePath = generated[0];
                            Log.info("Created " + filePath);
                            console.log(chalk_1.default.bgYellow(chalk_1.default.black('/!\\ WARNING /!\\ :')) +
                                ("\nYou have generated a Super User named " + chalk_1.default.red("admin") + " for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsibility to change this password to your own password"));
                        })
                            .catch(function (e) {
                            Log.error("Failed to create super user : " + e.message);
                        })];
                case 4:
                    _a.sent();
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
exports.handler = handler;
;
