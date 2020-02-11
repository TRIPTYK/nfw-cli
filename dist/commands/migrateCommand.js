/**
 * @module migrateCommmand
 * @description Command module to execute migration of a model
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
// Node modules
var reservedWords = require('reserved-words');
var Spinner = require('clui').Spinner;
var chalk = require('chalk');
// Project imports
var commandUtils = require('./commandUtils');
var Log = require('../utils/log');
var migrateAction = require('../actions/migrateAction');
var utils = require('../actions/lib/utils');
/**
 * Yargs command
 * @type {string}
 */
exports.command = 'migrate <migrateName>';
/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ["mig", "M"];
/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generate, compile and run the migration';
/**
 * Yargs command builder
 */
exports.builder = function (yargs) {
    yargs.check(_validateArgs);
    yargs.option('restore', {
        desc: "Restore migration data at a specific state",
        type: "boolean",
        default: false
    });
    yargs.option('revert', {
        desc: "Revert migration at a specific state",
        type: "boolean",
        default: false
    });
    yargs.option('dump', {
        desc: 'dump',
        type: "boolean",
        default: false
    });
};
/**
 *
 * @param argv
 * @param options
 * @return {boolean}
 */
var _validateArgs = function (argv, options) {
    if (!utils.isAlphanumeric(argv.migrateName))
        throw new Error("<migrateName> is non alphanumeric");
    if (reservedWords.check(argv.migrateName, 6))
        throw new Error("<migrateName> is a reserved word");
    return true;
};
/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = function (argv) { return __awaiter(_this, void 0, void 0, function () {
    var modelName, restore, dump, revert, spinner;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                modelName = argv.migrateName;
                restore = argv.restore;
                dump = argv.dump;
                revert = argv.revert;
                spinner = new Spinner("Generating and executing migration");
                commandUtils.validateDirectory();
                return [4 /*yield*/, commandUtils.checkConnectToDatabase()];
            case 1:
                _a.sent();
                commandUtils.updateORMConfig();
                spinner.start();
                return [4 /*yield*/, migrateAction(modelName, restore, dump, revert)
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
            case 2:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); };
