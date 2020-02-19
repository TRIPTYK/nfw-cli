"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
 * @module startCommand
 * @description Command module to handle server start and monitoring
 * @author Deflorenne Amaury
 */
var chalk_1 = require("chalk");
// node modules
var inquirer = require("../utils/inquirer");
// Project imports
var commandUtils = require("./commandUtils");
var startAction = require("../actions/startAction");
var migrateAction = require("../actions/migrateAction");
var sqlAdaptator_1 = require("../database/sqlAdaptator");
var Log = require("../utils/log");
var JsonFileWriter = require("json-file-rw");
//Yargs command
exports.command = 'start';
//Yargs command aliases
exports.aliases = [];
//Yargs command description
exports.describe = 'Start the api server';
//Yargs command builder
function builder(yargs) {
    yargs.option('env', {
        desc: "Specify the environement type",
        type: "string"
    });
}
exports.builder = builder;
;
//Main function
function handler(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var environement, monitoringEnabled, nfwFile, connected, currentEnv, sqlConnection, e_1, clonedEnv, dbName, confirmation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    commandUtils.validateDirectory();
                    environement = argv.env;
                    monitoringEnabled = argv.monitoring;
                    nfwFile = new JsonFileWriter();
                    nfwFile.openSync(".nfw");
                    if (environement === undefined) {
                        environement = nfwFile.getNodeValue("env", "development");
                    }
                    commandUtils.updateORMConfig(environement);
                    return [4 /*yield*/, commandUtils.startDockerContainers(environement)];
                case 1:
                    _a.sent();
                    currentEnv = commandUtils.getCurrentEnvironment().getEnvironment();
                    sqlConnection = new sqlAdaptator_1.SqlConnection();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 4, , 11]);
                    return [4 /*yield*/, sqlConnection.connect(currentEnv)];
                case 3:
                    _a.sent();
                    connected = true;
                    return [3 /*break*/, 11];
                case 4:
                    e_1 = _a.sent();
                    connected = e_1;
                    clonedEnv = __assign({}, currentEnv);
                    delete clonedEnv.TYPEORM_DB;
                    return [4 /*yield*/, sqlConnection.connect(clonedEnv).catch(function (e) {
                            Log.error("Failed to pre-connect to database : " + e.message);
                            Log.info("Please check your " + environement + " configuration and if your server is running");
                            process.exit(1);
                        })];
                case 5:
                    _a.sent();
                    if (!(e_1.code === 'ER_BAD_DB_ERROR')) return [3 /*break*/, 10];
                    dbName = currentEnv.TYPEORM_DB;
                    return [4 /*yield*/, new inquirer.Inquirer().askForConfirmation("Database '" + dbName + "' does not exists , do you want to create the database ?")];
                case 6:
                    confirmation = (_a.sent()).confirmation;
                    if (!confirmation) return [3 /*break*/, 8];
                    return [4 /*yield*/, sqlConnection.createDatabase(dbName)];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [4 /*yield*/, new migrateAction.MigrateActionClass("create-db-" + dbName).main()
                        .then(function (generated) {
                        var migrationDir = generated[0];
                        Log.success("Executed migration successfully");
                        Log.info("Generated in " + chalk_1.default.cyan(migrationDir));
                        connected = true;
                    })
                        .catch(function (err) {
                        connected = err;
                    })];
                case 9:
                    _a.sent();
                    _a.label = 10;
                case 10: return [3 /*break*/, 11];
                case 11:
                    if (connected === true) {
                        new startAction.StartActionClass(environement, monitoringEnabled).main();
                    }
                    else
                        Log.error("Server can't start because database connection failed : " + connected.message);
                    return [2 /*return*/];
            }
        });
    });
}
exports.handler = handler;
;
