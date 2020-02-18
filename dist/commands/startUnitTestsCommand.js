"use strict";
/**
 * @module startUnitTestsCommand
 * @description Command module to handle unit test execution
 * @author Deflorenne Amaury
 */
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
// node mosules
var JsonFileWriter = require("json-file-rw");
var util = require("util");
var exec = util.promisify(require('child_process').exec);
var fs = require("fs");
var dotenv = require("dotenv");
var chalk_1 = require("chalk");
// Project imports
var commandUtils = require("./commandUtils");
var clui_1 = require("clui");
var startUnitTestsAction = require("../actions/startUnitTestsAction");
var Log = require("../utils/log");
var migrateAction = require("../actions/migrateAction");
var sqlAdaptator_1 = require("../database/sqlAdaptator");
var inquirer = require("../utils/inquirer");
//Yargs command
exports.command = 'test';
//Yargs command aliases
exports.aliases = ['t'];
//Yargs command description
exports.describe = 'Executes unit tests';
//Yargs command builder
exports.builder = function (yargs) { };
//Main function
function handler(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var status, envFileContent, ormconfigFile, envFile, nfwFile, containerName, connected, currentEnv, sqlConnection, e_1, clonedEnv, dbName, confirmation;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    status = new clui_1.Spinner('Executing unit tests, please wait ...');
                    status.start();
                    commandUtils.validateDirectory();
                    envFileContent = fs.readFileSync("test.env");
                    ormconfigFile = new JsonFileWriter();
                    ormconfigFile.openSync("ormconfig.json");
                    envFile = dotenv.parse(envFileContent);
                    ormconfigFile.setNodeValue("name", envFile.TYPEORM_NAME);
                    ormconfigFile.setNodeValue("host", envFile.TYPEORM_HOST);
                    ormconfigFile.setNodeValue("database", envFile.TYPEORM_DB);
                    ormconfigFile.setNodeValue("username", envFile.TYPEORM_USER);
                    ormconfigFile.setNodeValue("password", envFile.TYPEORM_PWD);
                    ormconfigFile.setNodeValue("port", envFile.TYPEORM_PORT);
                    ormconfigFile.saveSync();
                    nfwFile = new JsonFileWriter();
                    nfwFile.openSync(".nfw");
                    if (!nfwFile.nodeExists('dockerContainer')) return [3 /*break*/, 2];
                    containerName = nfwFile.getNodeValue('dockerContainer');
                    Log.info("Starting your docker container " + containerName);
                    return [4 /*yield*/, exec("docker start " + containerName).then(function (data) {
                            console.log(data.stdout);
                        })];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    currentEnv = commandUtils.getCurrentEnvironment().getEnvironment();
                    sqlConnection = new sqlAdaptator_1.SqlConnection();
                    _a.label = 3;
                case 3:
                    _a.trys.push([3, 5, , 12]);
                    return [4 /*yield*/, sqlConnection.connect(currentEnv)];
                case 4:
                    _a.sent();
                    connected = true;
                    return [3 /*break*/, 12];
                case 5:
                    e_1 = _a.sent();
                    connected = e_1;
                    clonedEnv = __assign({}, currentEnv);
                    delete clonedEnv.TYPEORM_DB;
                    return [4 /*yield*/, sqlConnection.connect(clonedEnv)];
                case 6:
                    _a.sent();
                    if (!(e_1.code === 'ER_BAD_DB_ERROR')) return [3 /*break*/, 11];
                    dbName = currentEnv.TYPEORM_DB;
                    return [4 /*yield*/, new inquirer.Inquirer().askForConfirmation("Database '" + dbName + "' does not exists , do you want to create the database ?")];
                case 7:
                    confirmation = (_a.sent()).confirmation;
                    if (!confirmation) return [3 /*break*/, 9];
                    return [4 /*yield*/, sqlConnection.createDatabase(dbName)];
                case 8:
                    _a.sent();
                    _a.label = 9;
                case 9: return [4 /*yield*/, new migrateAction.MigrateActionClass("create-db-" + dbName).Main()
                        .then(function (generated) {
                        var migrationDir = generated[0];
                        Log.success("Executed migration successfully");
                        Log.info("Generated in " + chalk_1.default.cyan(migrationDir));
                        connected = true;
                    })
                        .catch(function (err) {
                        connected = err;
                    })];
                case 10:
                    _a.sent();
                    _a.label = 11;
                case 11: return [3 /*break*/, 12];
                case 12:
                    if (!(connected === true)) return [3 /*break*/, 14];
                    return [4 /*yield*/, startUnitTestsAction.main()];
                case 13:
                    _a.sent();
                    return [3 /*break*/, 15];
                case 14:
                    Log.error("Server can't start because database connection failed : " + connected.message);
                    _a.label = 15;
                case 15:
                    status.stop();
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
exports.handler = handler;
;
