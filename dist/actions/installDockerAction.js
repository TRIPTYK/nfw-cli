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
exports.InstallDockerActionAclass = void 0;
var util = require("util");
var exec = util.promisify(require('child_process').exec);
var Log = require("../utils/log");
var docker_cli_js_1 = require("docker-cli-js");
var JsonFileWriter = require("json-file-rw");
var EnvFileWriter = require("env-file-rw");
var inquirer_1 = require("../utils/inquirer");
var InstallDockerActionAclass = /** @class */ (function () {
    function InstallDockerActionAclass(strategy, name, port, version, password) {
        this.strategy = strategy;
        this.name = name;
        this.port = port;
        this.version = version;
        this.password = password;
    }
    InstallDockerActionAclass.prototype.setStrategy = function (strategy) {
        this.strategy = strategy;
    };
    InstallDockerActionAclass.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var docker, inquirer, envFileValues, data, portString, found, _i, _a, d, nfwFile, currentEnv, array, confirmation, envFileWriter;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        docker = new docker_cli_js_1.Docker();
                        inquirer = new inquirer_1.Inquirer();
                        envFileValues = this.strategy.createDockerContainer(this.name, this.port, this.version, this.password);
                        return [4 /*yield*/, exec("docker ps")
                                .catch(function (e) {
                                throw new Error('Cannot find or read docker file , please verify if docker is installed properly or that you have sufficient privileges.');
                            })];
                    case 1:
                        data = _b.sent();
                        return [4 /*yield*/, docker.command("ps -a")];
                    case 2:
                        data = _b.sent();
                        portString = "0.0.0.0:" + envFileValues.port + "->" + envFileValues.port + "/tcp, 33060/tcp";
                        found = data.containerList.find(function (d) {
                            return d.names === envFileValues.name;
                        });
                        if (found) {
                            throw new Error("Container " + found.names + " already exists, please use --name to change container name");
                        }
                        for (_i = 0, _a = data.containerList; _i < _a.length; _i++) {
                            d = _a[_i];
                            if (d.status.includes("Up") && d.ports === portString) {
                                Log.warning("Container " + d.names + " is configured with this port and is running");
                            }
                            else {
                                Log.info("Container " + d.names + " is configured with this port but is not running");
                            }
                        }
                        return [4 /*yield*/, exec("docker pull " + envFileValues.dbType + ":" + envFileValues.version)];
                    case 3:
                        data = _b.sent();
                        console.log(data.stdout);
                        return [4 /*yield*/, exec("docker create --name " + envFileValues.name + " -p " + envFileValues.port + ":" + envFileValues.port + " -e " + envFileValues.complementaryEnvInfos + " " + envFileValues.dbType + ":" + envFileValues.version)];
                    case 4:
                        data = _b.sent();
                        console.log(data.stdout);
                        nfwFile = new JsonFileWriter();
                        nfwFile.openSync('.nfw');
                        currentEnv = nfwFile.getNodeValue("env", "development");
                        array = nfwFile.getNodeValue(currentEnv + ".dockerContainers", []);
                        array.push(envFileValues.name);
                        nfwFile.saveSync();
                        Log.success("Your docker container was created on localhost , port " + envFileValues.port + " with " + envFileValues.dbType + " version " + envFileValues.version + " and password " + envFileValues.password);
                        return [4 /*yield*/, inquirer.askForConfirmation("Do you want to update your current environment file with these values ?")];
                    case 5:
                        confirmation = (_b.sent()).confirmation;
                        if (confirmation) {
                            envFileWriter = new EnvFileWriter(currentEnv + '.env');
                            envFileWriter.setNodeValue('TYPEORM_HOST', envFileValues.host);
                            envFileWriter.setNodeValue('TYPEORM_TYPE', envFileValues.envDBType);
                            envFileWriter.setNodeValue('TYPEORM_PWD', envFileValues.password);
                            envFileWriter.setNodeValue('TYPEORM_PORT', envFileValues.port);
                            envFileWriter.saveSync();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return InstallDockerActionAclass;
}());
exports.InstallDockerActionAclass = InstallDockerActionAclass;
