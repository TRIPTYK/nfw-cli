/**
 * @module createSuperUserCommand
 * @description Creates a super user in the boilerplate database
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
//Node modules imports
var chalk = require('chalk');
// Project imports
var commandUtils = require('./commandUtils');
var Log = require('../utils/log');
var createSuperUserAction = require('../actions/createSuperUserAction');
/**
 * Yargs command syntax
 * @type {string}
 */
exports.command = 'createUser <username>';
/**
 * Yargs command aliases
 * @type {string[]}
 */
exports.aliases = ['cu'];
/**
 * Yargs command description
 * @type {string}
 */
exports.describe = 'Create a Super User and save the credentials in a file';
/**
 *  Yargs command builder
 */
exports.builder = function (yargs) {
    yargs.option('mail', {
        alias: 'e',
        type: 'string',
        description: 'Email address of the user'
    });
    yargs.option('role', {
        alias: 'r',
        type: 'string',
        description: 'Role of the user (ex : admin,user,ghost)'
    });
    yargs.option('password', {
        alias: 'p',
        type: 'string',
        description: 'Password of the user'
    });
};
/**
 * Main function
 * @param argv
 * @return {Promise<void>}
 */
exports.handler = function (argv) { return __awaiter(_this, void 0, void 0, function () {
    var username, mail, role, password;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                username = argv.username, mail = argv.mail, role = argv.role, password = argv.password;
                commandUtils.validateDirectory();
                return [4 /*yield*/, commandUtils.checkConnectToDatabase()];
            case 1:
                _a.sent();
                commandUtils.updateORMConfig();
                return [4 /*yield*/, createSuperUserAction({ username: username, mail: mail, role: role, password: password })
                        .then(function (generated) {
                        var filePath = generated[0];
                        Log.info("Created " + filePath);
                        console.log(chalk.bgYellow(chalk.black('/!\\ WARNING /!\\ :')) +
                            ("\nYou have generated a " + role + " user named " + chalk.red(username) + " for your API, the credentials are written in the file named \"credentials.json\" located int he root folder, please modify the password as soon as possible, we are not responsible if someone finds it, it is your responsibility to change this password to your own password"));
                    })
                        .catch(function (e) {
                        Log.error("Failed to create super user : " + e.message);
                    })];
            case 2:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); };
