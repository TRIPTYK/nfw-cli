/**
 * node modules imports
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
/**
 * project imports
 */
var installDockerAction = require('../actions/installDockerAction');
var Log = require('../utils/log');
var JsonFileWriter = require('json-file-rw');
var EnvFileWriter = require('env-file-rw');
var inquirer = require('../utils/inquirer');
exports.command = 'setupMysql';
exports.aliases = ['smysql'];
exports.describe = 'desc';
exports.builder = function (yargs) {
    yargs.option('name', {
        type: "string",
        default: "nfw_server_docker"
    });
    yargs.option('port', {
        type: "string",
        default: "3306"
    });
    yargs.option('vers', {
        type: "string",
        default: "5.7"
    });
    yargs.option('password', {
        type: "string",
        default: "test123*"
    });
};
exports.handler = function (argv) {
    return __awaiter(_this, void 0, void 0, function () {
        var name, port, vers, password, nfwFile, currentEnv, array, confirmation, envFileWriter;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    name = argv.name, port = argv.port, vers = argv.vers, password = argv.password;
                    return [4 /*yield*/, installDockerAction(name, port, vers, password).catch(function (e) {
                            Log.error(e.message);
                            process.exit();
                        })];
                case 1:
                    _a.sent();
                    nfwFile = new JsonFileWriter();
                    nfwFile.openSync('.nfw');
                    currentEnv = nfwFile.getNodeValue("env", "development");
                    array = nfwFile.getNodeValue(currentEnv + ".dockerContainers", []);
                    array.push(name);
                    nfwFile.saveSync();
                    Log.success("Your docker container was created on localhost , port " + port + " with mysql version " + vers + " and password " + password);
                    return [4 /*yield*/, inquirer.askForConfirmation("Do you want to update your current environment file with these values ?")];
                case 2:
                    confirmation = (_a.sent()).confirmation;
                    if (confirmation) {
                        envFileWriter = new EnvFileWriter(currentEnv + '.env');
                        envFileWriter.setNodeValue('TYPEORM_HOST', 'localhost');
                        envFileWriter.setNodeValue('TYPEORM_TYPE', 'mysql');
                        envFileWriter.setNodeValue('TYPEORM_PWD', password);
                        envFileWriter.setNodeValue('TYPEORM_PORT', port);
                        envFileWriter.saveSync();
                    }
                    return [2 /*return*/];
            }
        });
    });
};
