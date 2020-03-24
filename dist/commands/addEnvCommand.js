"use strict";
/**
 * @module addEnvCommand
 * @description  Command module for creating a new environment file
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
var fs = require("fs");
var dotenv = require("dotenv");
var chalk_1 = require("chalk");
// Project modules
var editEnvAction_1 = require("../actions/editEnvAction");
var commandUtils = require("./commandUtils");
var Log = require("../utils/log");
//Yargs command syntax
exports.command = 'addENV <env>';
//Yargs command alias
exports.aliases = ["ae", "addE"];
//Command description
exports.describe = 'Generate a new environement based on asked question';
//Yargs builder
function builder() { }
exports.builder = builder;
;
//description : Main command handler
function handler(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var env, chosenOne;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    env = argv.env;
                    commandUtils.validateDirectory();
                    console.log(chalk_1.default.blue('The default choices are based on the default environement setting -> developement.env'));
                    chosenOne = dotenv.parse(fs.readFileSync("development.env"));
                    return [4 /*yield*/, new editEnvAction_1.EditEnvActionClass(env, chosenOne).main()
                            .then(function (written) {
                            var envFile = written[0];
                            Log.success("New environment generated successfully");
                            Log.info("Created " + chalk_1.default.cyan(envFile));
                        })
                            .catch(function (e) {
                            Log.error("Failed to generate new environment : " + e.message);
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handler = handler;
;
