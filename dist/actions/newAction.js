"use strict";
/**
 * @author Samuel Antoine
 * @module newAction
 * @description Generates and setup a new boilerplate project
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
/// node modules
var util = require("util");
var chalk_1 = require("chalk");
//const figlet = require('figlet');
var path = require("path");
var fs = require("fs");
var clui_1 = require("clui");
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
// project modules
var files = require("../utils/files");
var inquirer = require("../utils/inquirer");
var Log = require("../utils/log");
var utils = require("./lib/utils");
var JsonFileWriter = require("json-file-rw");
var EnvFileWriter = require("env-file-rw");
// promisified
var exec = util.promisify(require('child_process').exec);
var rmdir = util.promisify(rimraf);
var renameDir = util.promisify(fs.rename);
var WriteFile = util.promisify(fs.writeFile);
// module vars
var newPath = undefined;
var NewActionClass = /** @class */ (function () {
    function NewActionClass(name, defaultenv, pathoption, yarn) {
        this.name = name;
        this.defaultEnv = defaultenv;
        this.pathOption = pathoption;
        this.yarn = yarn;
    }
    //description: Generate a new project
    NewActionClass.prototype.Main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var pckManager, envVar, kickstart, setupEnv, config, envFilePath, ormConfigPath, envFileWriter, jsonFileWriter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        pckManager = this.yarn ? 'yarn' : 'npm';
                        if (!this.pathOption) return [3 /*break*/, 2];
                        return [4 /*yield*/, inquirer.askForNewPath()];
                    case 1:
                        newPath = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (files.directoryExists(path.resolve(newPath === undefined ? process.cwd() : newPath.path, "nfw")) || files.directoryExists(path.resolve(newPath === undefined ? process.cwd() : newPath.path, this.name))) {
                            console.log(chalk_1.default.red('Error :') + ("You already have a directory name \"nfw\" or \"" + this.name + "\" !"));
                            process.exit(0);
                        }
                        envVar = undefined;
                        if (!this.defaultEnv) return [3 /*break*/, 4];
                        return [4 /*yield*/, inquirer.askForEnvVariable()];
                    case 3:
                        envVar = _a.sent();
                        envVar.URL = "http://localhost:" + envVar.PORT;
                        _a.label = 4;
                    case 4: return [4 /*yield*/, _gitCloneAndRemove(this.name)];
                    case 5:
                        _a.sent();
                        process.chdir(this.name); // set current directory inside boilerplate
                        kickstart = new clui_1.Spinner('Generating app ...');
                        kickstart.start();
                        mkdirp.sync("./dist/migration/dump");
                        mkdirp.sync("./dist/logs");
                        mkdirp.sync("./dist/uploads/documents/xs");
                        mkdirp.sync("./dist/uploads/documents/xl");
                        mkdirp.sync("./dist/uploads/documents/md");
                        return [4 /*yield*/, exec(pckManager + " " + (this.yarn ? 'add' : 'install') + " bcrypt --save")
                                .then(function () { return console.log(chalk_1.default.green("Installed bcrypt successfully")); })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, exec(pckManager + " " + (this.yarn ? '' : 'install'))
                                .then(function () { return console.log(chalk_1.default.green("Installed packages successfully")); })];
                    case 7:
                        _a.sent();
                        kickstart.stop();
                        setupEnv = envVar === undefined ? 'development' : envVar.env.toLowerCase();
                        config = {
                            name: this.name,
                            path: process.cwd(),
                            env: setupEnv
                        };
                        return [4 /*yield*/, WriteFile(config.path + "/.nfw", JSON.stringify(config, null, 2))
                                .then(function () { return Log.success("Config file generated successfully"); })];
                    case 8:
                        _a.sent();
                        if (this.defaultEnv) {
                            envFilePath = newPath === undefined ? setupEnv + ".env" : path.resolve(newPath.path, setupEnv + ".env");
                            ormConfigPath = newPath === undefined ? "ormconfig.json" : path.resolve(newPath.path, "ormconfig.json");
                            envFileWriter = new EnvFileWriter(envFilePath);
                            jsonFileWriter = new JsonFileWriter();
                            jsonFileWriter.openSync(ormConfigPath);
                            jsonFileWriter.setNodeValue("host", envVar.TYPEORM_HOST);
                            jsonFileWriter.setNodeValue("port", envVar.TYPEORM_PORT);
                            jsonFileWriter.setNodeValue("username", envVar.TYPEORM_USER);
                            jsonFileWriter.setNodeValue("password", envVar.TYPEORM_PWD);
                            jsonFileWriter.setNodeValue("database", envVar.TYPEORM_DB);
                            envFileWriter.setNodeValue("TYPEORM_HOST", envVar.TYPEORM_HOST);
                            envFileWriter.setNodeValue("TYPEORM_DB", envVar.TYPEORM_DB);
                            envFileWriter.setNodeValue("TYPEORM_PORT", envVar.TYPEORM_PORT);
                            envFileWriter.setNodeValue("TYPEORM_USER", envVar.TYPEORM_USER);
                            envFileWriter.setNodeValue("TYPEORM_PWD", envVar.TYPEORM_PWD);
                            jsonFileWriter.saveSync();
                            envFileWriter.saveSync();
                        }
                        return [4 /*yield*/, utils.createDataBaseIfNotExists(setupEnv)];
                    case 9:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return NewActionClass;
}());
exports.NewActionClass = NewActionClass;
/*
 * Git clone and deletes .git folder
 * @param {string} name
 * @returns {Promise<void>}
 */
var _gitCloneAndRemove = function (name) { return __awaiter(void 0, void 0, void 0, function () {
    var clone, newDirPath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                Log.success('Cloning repository  ...');
                return [4 /*yield*/, exec("git clone https://github.com/TRIPTYK/nfw.git --branch=develop")];
            case 1:
                clone = _a.sent();
                if (clone.stderr.length) {
                    Log.success('Git repository cloned successfully ....');
                }
                else {
                    Log.error(clone.stdout);
                }
                newDirPath = process.cwd() + "/" + name;
                // rename git folder command
                return [4 /*yield*/, renameDir(process.cwd() + "/nfw", newDirPath)
                        .then(function () { return Log.success('Renamed directory successfully'); })];
            case 2:
                // rename git folder command
                _a.sent();
                return [4 /*yield*/, rmdir(newDirPath + "/.git")
                        .then(function () { return Log.success('.git folder successfully deleted ...'); })];
            case 3:
                _a.sent();
                Log.success("Project successfully set up ....");
                return [2 /*return*/];
        }
    });
}); };
