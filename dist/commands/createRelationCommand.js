"use strict";
/**
 * @module createRelationCommand
 * @description Command module to handle creating relation between 2 models
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
// Project imports
var commandUtils = require("./commandUtils");
var migrateAction = require("../actions/migrateAction");
var createRelationAction = require("../actions/createRelationAction");
var Log = require("../utils/log");
var utils_1 = require("../actions/lib/utils");
//node modules
var clui_1 = require("clui");
var chalk_1 = require("chalk");
var pluralize_1 = require("pluralize");
//Yargs command syntax
exports.command = 'addRelationship <relation> <model1> <model2>';
//Aliases for Yargs command
exports.aliases = ['ar', 'addR'];
//Command description
exports.describe = 'Create  relation between two table';
//Handle and build command options
function builder(yargs) {
    yargs.choices('relation', ['mtm', 'mto', 'otm', 'oto']);
    yargs.option('name', {
        desc: "Specify the name of foreign key (for Oto) or the name of the bridging table (for Mtm)",
        type: "string",
        default: null
    });
    yargs.option('refCol', {
        desc: "Specify referenced column for a oto relation",
        type: "string",
        default: null
    });
    yargs.option('m1Name', {
        desc: "Specify the name of the column for the first model",
        type: "string",
        default: null
    });
    yargs.option('m2Name', {
        desc: "Specify the name of the column for the second model",
        type: "string",
        default: null
    });
}
exports.builder = builder;
;
/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
//Main function 
function handler(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var model1, model2, relation, name, refCol, m1Name, m2Name;
        var _this = this;
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
                    model1 = utils_1.format(argv.model1);
                    model2 = utils_1.format(argv.model2);
                    relation = argv.relation;
                    name = argv.name;
                    refCol = argv.refCol;
                    m1Name = argv.m1Name ? pluralize_1.singular(utils_1.format(argv.m1Name)) : model1;
                    m2Name = argv.m2Name ? pluralize_1.singular(utils_1.format(argv.m2Name)) : model2;
                    return [4 /*yield*/, new createRelationAction.CreateRelationActionClass(model1, model2, relation, name, refCol, m1Name, m2Name).main()
                            .then(function () { return __awaiter(_this, void 0, void 0, function () {
                            var spinner;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        Log.success("Relation successfully added !");
                                        spinner = new clui_1.Spinner("Generating and executing migration");
                                        spinner.start();
                                        return [4 /*yield*/, new migrateAction.MigrateActionClass(model1 + "-" + model2).main()
                                                .then(function (generated) {
                                                spinner.stop();
                                                var migrationDir = generated[0];
                                                Log.success("Executed migration successfully");
                                                Log.info("Generated in " + chalk_1.default.cyan(migrationDir));
                                            })
                                                .catch(function (e) {
                                                spinner.stop();
                                                Log.error(e.message);
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })
                            .catch(function (err) { return Log.error(err.message); })];
                case 3:
                    _a.sent();
                    process.exit(0);
                    return [2 /*return*/];
            }
        });
    });
}
exports.handler = handler;
;
