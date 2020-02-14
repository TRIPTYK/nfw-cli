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
// node modules
var spawn = require('cross-spawn');
var util = require('util');
var path = require('path');
var exec = util.promisify(require('child_process').exec);
var fs = require('fs');
// project modules
var _a = require('../database/sqlAdaptator'), DatabaseEnv = _a.DatabaseEnv, getSqlConnectionFromNFW = _a.getSqlConnectionFromNFW;
var Log = require('../utils/log');
/**
 *
 * @param env
 * @param mode
 * @returns {Promise<void>}
 */
module.exports = function (env, mode, deployDB) { return __awaiter(_this, void 0, void 0, function () {
    var loadedEnv, deploy, stdout, connection, dumpFile;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                loadedEnv = new DatabaseEnv();
                loadedEnv.loadFromFile(env + '.env');
                deploy = require(process.cwd() + "/ecosystem.config").deploy;
                if (!deploy.hasOwnProperty(env)) {
                    throw new Error(env + " environment does not exists");
                }
                return [4 /*yield*/, exec(path.resolve("./node_modules/.bin/pm2 -v"))];
            case 1:
                stdout = (_a.sent()).stdout;
                Log.info("PM2 local version is " + stdout);
                if (!deployDB) return [3 /*break*/, 5];
                Log.info("connecting to DB ...");
                return [4 /*yield*/, getSqlConnectionFromNFW()];
            case 2:
                connection = _a.sent();
                Log.success('Connected');
                Log.info("Creating dump ...");
                return [4 /*yield*/, connection.dumpAll('tmpdb', {
                        dumpOptions: {
                            schema: {
                                table: {
                                    dropIfExist: false
                                }
                            },
                            tables: ['migration_table'],
                            excludeTables: true,
                            data: false
                        }
                    })];
            case 3:
                _a.sent();
                Log.success('Done');
                dumpFile = fs.readFileSync('tmpdb.sql', 'utf-8');
                Log.info("Creating database on remote host ...");
                return [4 /*yield*/, connection.query(dumpFile)];
            case 4:
                _a.sent();
                Log.success('Done');
                Log.info("Cleaning up temp files ...");
                fs.unlinkSync('tmpdb.sql');
                _a.label = 5;
            case 5:
                if (mode === 'setup') {
                    spawn.sync("./node_modules/.bin/pm2 deploy " + env + " setup", [], { stdio: 'inherit', shell: true });
                }
                else if (mode === 'update') {
                    spawn.sync("./node_modules/.bin/pm2 deploy " + env + " update", [], { stdio: 'inherit', shell: true });
                }
                else if (mode === 'revert') {
                    spawn.sync("./node_modules/.bin/pm2 deploy " + env + " revert 1", [], { stdio: 'inherit', shell: true });
                }
                else {
                    Log.warning("No action specified");
                    process.exit(0);
                }
                return [2 /*return*/];
        }
    });
}); };
