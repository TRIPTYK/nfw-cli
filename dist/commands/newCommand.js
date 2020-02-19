"use strict";
/**
 * @module newCommand
 * @description Command module to handle generation of a new project
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
// Node modules
var chalk_1 = require("chalk");
var clearConsole = require("clear");
var clui_1 = require("clui");
// Project imports
var newAction = require("../actions/newAction");
var migrateAction = require("../actions/migrateAction");
var createSuperUserAction = require("../actions/createSuperUserAction");
var Log = require("../utils/log");
//yargs comand
exports.command = 'new <name>';
//yargs command aliases
exports.aliases = ['n'];
//yargs command desc
exports.describe = 'Generate a new project';
//Yargs command builder
function builder(yargs) {
    yargs.option('default', {
        desc: "Generate a project with default env variables",
        type: "boolean",
        default: false
    });
    yargs.option('path', {
        desc: "Allow the user to choose a different path",
        type: 'boolean',
        default: false
    });
    yargs.option('yarn', {
        desc: "Set yarn as package manager instead of npm",
        type: 'boolean',
        default: false
    });
}
exports.builder = builder;
;
//Main function
function handler(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var name, defaultEnv, useDifferentPath, useYarn, migrationSpinner;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    name = argv.name;
                    defaultEnv = argv.default;
                    useDifferentPath = argv.path;
                    useYarn = argv.yarn;
                    clearConsole();
                    console.log(chalk_1.default.blue('NFW'));
                    // process cwd is changed in newAction to the new project folder
                    return [4 /*yield*/, new newAction.NewActionClass(name, !defaultEnv, useDifferentPath, useYarn).main()
                            .then(function () {
                            Log.success("New project generated successfully");
                        })
                            .catch(function (e) {
                            console.log(e);
                            Log.error("Error when generating new project : " + e.message);
                            process.exit();
                        })];
                case 1:
                    // process cwd is changed in newAction to the new project folder
                    _a.sent();
                    migrationSpinner = new clui_1.Spinner("Executing migration ...");
                    migrationSpinner.start();
                    return [4 /*yield*/, new migrateAction.MigrateActionClass("init_project").main()
                            .then(function (generated) {
                            var migrationDir = generated[0];
                            Log.success("Executed migration successfully");
                            Log.info("Generated in " + chalk_1.default.cyan(migrationDir));
                        })
                            .catch(function (e) {
                            Log.error("Failed to execute migration : " + e.message);
                        })];
                case 2:
                    _a.sent();
                    migrationSpinner.stop();
                    return [4 /*yield*/, new createSuperUserAction.CreateSuperUSerActionClass("admin").main()
                            .then(function (generated) {
                            var filePath = generated[0];
                            Log.info("Created " + filePath);
                            console.log(chalk_1.default.bgYellow(chalk_1.default.black('/!\\ WARNING /!\\ :')) +
                                ("\nA Super User named " + chalk_1.default.red('admin') + " has been generated for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsibility to change this password to your own password"));
                        })
                            .catch(function (e) {
                            Log.error("Failed to create super user : " + e.message);
                        })];
                case 3:
                    _a.sent();
                    process.exit();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handler = handler;
;
