"use strict";
/**
 * @module commandUtils
 * @description Functions to help in command modules
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
Object.defineProperty(exports, "__esModule", { value: true });
// node modules
var chalk_1 = require("chalk");
var fs = require("fs");
var util_1 = require("util");
var path = require("path");
var util = require("util");
var exec = util.promisify(require('child_process').exec);
// project modules
var filesHelper = require("../utils/files");
var sqlAdaptator_1 = require("../database/sqlAdaptator");
var Log = require("../utils/log");
var readFilePromise = util_1.promisify(fs.readFile);
var JsonFileWriter = require("json-file-rw");
var dotenv = require("dotenv");
//Check if we are in a valid project directory
function validateDirectory() {
    if (!filesHelper.isProjectDirectory()) {
        console.log(chalk_1.default.bgRed(chalk_1.default.black('ERROR ! : You are not in a project directory')));
        process.exit(0);
    }
}
exports.validateDirectory = validateDirectory;
;
function checkValidParamk(string) {
    if (!util.isString(string)) {
        Log.error("'" + string + "' must be alphanumeric and not beginning by a number");
        process.exit();
    }
}
exports.checkValidParamk = checkValidParamk;
;
function startDockerContainers(environement) {
    return __awaiter(this, void 0, void 0, function () {
        var nfwFile, snooze, containers, _i, containers_1, container;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    nfwFile = new JsonFileWriter();
                    nfwFile.openSync(".nfw");
                    snooze = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
                    if (nfwFile.nodeExists(environement + ".dockerContainers")) {
                        containers = nfwFile.getNodeValue(environement + ".dockerContainers");
                        for (_i = 0, containers_1 = containers; _i < containers_1.length; _i++) {
                            container = containers_1[_i];
                            Log.info("Starting your docker container " + container);
                            exec("docker start " + container);
                        }
                    }
                    return [4 /*yield*/, snooze(1000)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.startDockerContainers = startDockerContainers;
function updateORMConfig(environement) {
    if (environement === void 0) { environement = null; }
    if (environement === null) {
        var nfwFile = new JsonFileWriter();
        nfwFile.openSync(".nfw");
        environement = nfwFile.getNodeValue("env", "development");
        nfwFile.saveSync();
    }
    var envFileContent = fs.readFileSync(environement + ".env");
    var ormconfigFile = new JsonFileWriter();
    ormconfigFile.openSync("ormconfig.json");
    var envFile = dotenv.parse(envFileContent);
    ormconfigFile.setNodeValue("cli.migrationsDir", path.join("./src/migration/", environement));
    ormconfigFile.setNodeValue("migrations", [
        "src/migration/" + environement + "/*.ts"
    ]);
    ormconfigFile.setNodeValue("type", envFile.TYPEORM_TYPE);
    ormconfigFile.setNodeValue("name", envFile.TYPEORM_NAME);
    ormconfigFile.setNodeValue("host", envFile.TYPEORM_HOST);
    ormconfigFile.setNodeValue("database", envFile.TYPEORM_DB);
    ormconfigFile.setNodeValue("username", envFile.TYPEORM_USER);
    ormconfigFile.setNodeValue("password", envFile.TYPEORM_PWD);
    ormconfigFile.setNodeValue("port", envFile.TYPEORM_PORT);
    return ormconfigFile.saveSync();
}
exports.updateORMConfig = updateORMConfig;
function checkConnectToDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, new sqlAdaptator_1.SqlConnection(exports.getCurrentEnvironment()).connect()];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 3];
                case 2:
                    e_1 = _a.sent();
                    Log.error("Can't connect to database : " + e_1.message);
                    process.exit();
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.checkConnectToDatabase = checkConnectToDatabase;
;
/**
 *
 * @returns {DatabaseEnv}
 */
function getCurrentEnvironment() {
    var nfwFile = fs.readFileSync('.nfw', 'utf-8');
    var nfwEnv = JSON.parse(nfwFile).env;
    if (!nfwEnv)
        nfwEnv = 'development';
    return new sqlAdaptator_1.DatabaseEnv(nfwEnv.toLowerCase() + ".env");
}
exports.getCurrentEnvironment = getCurrentEnvironment;
;
/**
 *
 * @return {Promise<void>}
 */
function checkVersion() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, packageJsonCLI, packageJsonNFW;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, Promise.all([readFilePromise(__baseDir + "/package.json", "utf-8"), readFilePromise(process.cwd() + "/package.json", "utf-8")])];
                case 1:
                    _a = _b.sent(), packageJsonCLI = _a[0], packageJsonNFW = _a[1];
                    packageJsonCLI = JSON.parse(packageJsonCLI);
                    packageJsonNFW = JSON.parse(packageJsonNFW);
                    if (packageJsonCLI.version > packageJsonNFW.version)
                        Log.warning("Your version of NFW is for an old verson of NFW-CLI , you may encounter unexpected behavior. Consider upgrading your nfw or downgrade your CLI to " + packageJsonNFW.version);
                    return [2 /*return*/];
            }
        });
    });
}
exports.checkVersion = checkVersion;
