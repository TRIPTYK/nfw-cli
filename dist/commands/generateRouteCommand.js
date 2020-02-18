"use strict";
/**
 * @module generateRouteCommand
 * @description Command module to handle route with controller generation
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
// Node modules imports
var snakeCase = require("to-snake-case");
var chalk_1 = require("chalk");
// Project imports
var commandUtils = require("./commandUtils");
var generateRouterAction = require("../actions/generateRouterAction");
var inquirer_1 = require("../utils/inquirer");
var utils_1 = require("../actions/lib/utils");
var files_1 = require("../utils/files");
var Log = require("../utils/log");
//Yargs command
exports.command = 'createRouter <routeName>';
//Yargs command aliases
exports.aliases = ['gr'];
//Yargs command description
exports.describe = 'Generate a router with associated controller methods without model';
//Yargs command builder
function builder() { }
exports.builder = builder;
;
//Main function
function handler(argv) {
    return __awaiter(this, void 0, void 0, function () {
        var routeName, lowercase, controllerPath, inquirer, confirmation, continueAsking, routes, routePath, routeMethods, continueAskingMethods, _a, routeMethod, controllerMethod, routeAuthorization;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    commandUtils.validateDirectory();
                    return [4 /*yield*/, commandUtils.checkVersion()];
                case 1:
                    _b.sent();
                    routeName = snakeCase(argv.routeName);
                    lowercase = utils_1.lowercaseEntity(routeName);
                    controllerPath = "/src/api/controllers/" + lowercase + ".controller.ts";
                    inquirer = new inquirer_1.Inquirer();
                    if (!files_1.fileExists(process.cwd() + controllerPath)) return [3 /*break*/, 3];
                    return [4 /*yield*/, inquirer.askForConfirmation(controllerPath + " already exists , do you want to override ?")];
                case 2:
                    confirmation = (_b.sent()).confirmation;
                    if (!confirmation) {
                        process.exit();
                    }
                    _b.label = 3;
                case 3:
                    continueAsking = true;
                    routes = [];
                    Log.info("Base route will be : /api/v1/" + routeName);
                    _b.label = 4;
                case 4:
                    if (!continueAsking) return [3 /*break*/, 11];
                    return [4 /*yield*/, inquirer.askRoutePath()];
                case 5:
                    routePath = (_b.sent()).routePath;
                    routeMethods = [];
                    continueAskingMethods = true;
                    _b.label = 6;
                case 6:
                    if (!continueAskingMethods) return [3 /*break*/, 9];
                    return [4 /*yield*/, inquirer.askRouteData()];
                case 7:
                    _a = _b.sent(), routeMethod = _a.routeMethod, controllerMethod = _a.controllerMethod, routeAuthorization = _a.routeAuthorization;
                    if (routeAuthorization === 'GHOST')
                        routeAuthorization = null; //quick fix because GHOST is by default
                    routeMethods.push({
                        method: routeMethod,
                        authorization: routeAuthorization,
                        controllerMethod: controllerMethod
                    });
                    return [4 /*yield*/, inquirer.askForConfirmation("Do you want to add a new method to route /api/v1/" + routeName + routePath + " ?")];
                case 8:
                    continueAskingMethods = (_b.sent()).confirmation;
                    return [3 /*break*/, 6];
                case 9:
                    routes.push({
                        path: routePath,
                        methods: routeMethods
                    });
                    return [4 /*yield*/, inquirer.askForConfirmation('Do you want to add a new route ?')];
                case 10:
                    continueAsking = (_b.sent()).confirmation;
                    return [3 /*break*/, 4];
                case 11: return [4 /*yield*/, new generateRouterAction.GenerateRouterActionClass(lowercase, routes).Main()
                        .then(function (writtenPaths) {
                        writtenPaths.forEach(function (path) {
                            Log.info("Created " + chalk_1.default.cyan(path));
                        });
                    })
                        .catch(function (error) {
                        console.log(error);
                        Log.error('Failed to generate : ' + error.message);
                    })];
                case 12:
                    _b.sent();
                    process.exit();
                    return [2 /*return*/];
            }
        });
    });
}
exports.handler = handler;
;
