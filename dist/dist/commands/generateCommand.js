/**
 * @module generateCommand
 * @description Command module to handle dynamic entity files generation for the boilerplate
 * @author Deflorenne Amaury
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
// Node modules imports
var reservedWords = require('reserved-words');
var Spinner = require('clui').Spinner;
var chalk = require('chalk');
// Project imports
var commandUtils = require('./commandUtils');
var generateAction = require('../actions/generateAction');
var migrateAction = require('../actions/migrateAction');
var generateDocAction = require('../actions/generateDocumentationAction');
var Log = require('../utils/log');
var generateDocSpinner = new Spinner('Generating documentation');
/**
 * Yargs command
 * @type {string}
 */
exports.command = 'generate <modelName> [CRUD] [part]';
/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['gen', 'g'];
/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Generate a new model';
/**
 * Yargs command builder
 * @param yargs
 */
exports.builder = function (yargs) {
    yargs.default('CRUD', 'CRUD');
    yargs.default('part', null);
};
/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = function (argv) {
    return __awaiter(_this, void 0, void 0, function () {
        var modelName, crud, part, crudOptions, spinner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    modelName = argv.modelName, crud = argv.crud, part = argv.part;
                    commandUtils.validateDirectory();
                    return [4 /*yield*/, commandUtils.checkVersion()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, commandUtils.checkConnectToDatabase()];
                case 2:
                    _a.sent();
                    if (reservedWords.check(modelName, 6)) {
                        console.log("modelName is a reserved word");
                        process.exit(0);
                    }
                    crudOptions = {
                        create: true,
                        read: true,
                        update: true,
                        delete: true
                    };
                    if ((/^[crud]{1,4}$/).test(crud)) {
                        crudOptions.create = crud.includes('c');
                        crudOptions.read = crud.includes('r');
                        crudOptions.update = crud.includes('u');
                        crudOptions.delete = crud.includes('d');
                    }
                    return [4 /*yield*/, generateAction(modelName, crudOptions, part)];
                case 3:
                    _a.sent();
                    spinner = new Spinner("Generating and executing migration");
                    spinner.start();
                    return [4 /*yield*/, migrateAction(modelName)
                            .then(function (generated) {
                            var migrationDir = generated[0];
                            spinner.stop();
                            Log.success("Executed migration successfully");
                            Log.info("Generated in " + chalk.cyan(migrationDir));
                        })
                            .catch(function (e) {
                            Log.error(e.message);
                            process.exit();
                        })];
                case 4:
                    _a.sent();
                    generateDocSpinner.start();
                    return [4 /*yield*/, generateDocAction()
                            .then(function () {
                            Log.success('Typedoc generated successfully');
                        })
                            .catch(function (e) {
                            Log.error('Typedoc failed to generate : ' + e.message);
                        })];
                case 5:
                    _a.sent();
                    generateDocSpinner.stop();
                    process.exit();
                    return [2 /*return*/];
            }
        });
    });
};
