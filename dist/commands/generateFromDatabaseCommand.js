/**
 * @module generateFromDatabaseCommand
 * @description Handle generating entity from database
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
// node modules imports
var chalk = require('chalk');
// project imports
var commandUtils = require('./commandUtils');
var inquirer = require('../utils/inquirer');
var Log = require('../utils/log');
var generateFromDatabaseAction = require('../actions/generateFromDatabaseAction');
/**
 * Yargs command
 * @type {string}
 */
exports.command = 'import';
/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['imp'];
/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generate all the files from existing tables in the database';
/**
 * Yargs command builder
 */
exports.builder = function () {
};
/**
 * Main function
 * @return {Promise<void>}
 */
exports.handler = function () { return __awaiter(_this, void 0, void 0, function () {
    var confirmation;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                commandUtils.validateDirectory();
                return [4 /*yield*/, commandUtils.checkVersion()];
            case 1:
                _a.sent();
                return [4 /*yield*/, commandUtils.checkConnectToDatabase()];
            case 2:
                _a.sent();
                return [4 /*yield*/, inquirer.askForConfirmation(chalk.bgYellow(chalk.black('Warning :')) + " generate model from the database will override existing models with the same name ! Do you want to continue ?")];
            case 3:
                confirmation = (_a.sent()).confirmation;
                if (!confirmation) return [3 /*break*/, 5];
                return [4 /*yield*/, generateFromDatabaseAction()
                        .then(function () {
                        Log.success('Generated from database successfully');
                    })
                        .catch(function (e) {
                        Log.error(e.message);
                    })];
            case 4:
                _a.sent();
                return [3 /*break*/, 6];
            case 5:
                console.log(chalk.bgRed(chalk.black('/!\\ Process Aborted /!\\')));
                process.exit(0);
                _a.label = 6;
            case 6:
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); };