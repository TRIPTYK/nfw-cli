/**
 * @author Antoine Samuel
 * @author Deflorenne Amaury
 * @description Generate and executes a migration
 * @module migrateAction
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
var getSqlConnectionFromNFW = require("../database/sqlAdaptator").getSqlConnectionFromNFW;
// Node modules
var JsonFileWriter = require("json-file-rw");
var util = require('util');
var fs = require('fs');
var chalk = require('chalk');
var mkdirp = util.promisify(require('mkdirp'));
var child_process = require('child_process');
var exec = util.promisify(child_process.exec);
var path = require('path');
var project = require('../utils/project');
var Log = require('../utils/log');
var _buildErrorObjectFromMessage = function (e) {
    var msgReg = /^\s*(\w+):\s*([ -+|\--z]*),?/gm;
    var m;
    var errObj = {};
    while ((m = msgReg.exec(e.message)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === msgReg.lastIndex) {
            msgReg.lastIndex++;
        }
        var property = m[1], content = m[2];
        errObj[property] = content
            .replace(/^'|'$/g, "")
            .replace(/\\'/g, "'");
    }
    return errObj;
};
/**
 * Main function
 * @param modelName
 * @param restore
 * @param dump
 * @returns {Promise<array>}
 */
module.exports = function (modelName, restore, dump, isRevert) { return __awaiter(_this, void 0, void 0, function () {
    var ormConfig, connection, getMigrationFileNameFromRecord, nfwConfig, currentEnv, migrationDir, migrationConfig, formatMigrationArray, revertTo, dump_1, allTables, _a, formatMigrationArray, _b, revertTo, current, between, errors_1, success_1, _i, between_1, forMigration, forMigrationFileName, migrationFile, functionText, regexDownStatement, res, allTables, _c, typeorm_cli, ts_node, files, recentTimestamp, migrationFile, obj, backupDir, latest, dumpName;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                ormConfig = new JsonFileWriter();
                ormConfig.openSync("./ormconfig.json");
                return [4 /*yield*/, getSqlConnectionFromNFW()];
            case 1:
                connection = _d.sent();
                getMigrationFileNameFromRecord = function (record) { return record.timestamp + '-' + record.name.replace(record.timestamp.toString(), ''); };
                nfwConfig = new JsonFileWriter();
                nfwConfig.openSync(".nfw");
                currentEnv = nfwConfig.getNodeValue("env", "development");
                return [4 /*yield*/, mkdirp("src/migration/" + currentEnv + "/failed")];
            case 2:
                _d.sent();
                migrationDir = ormConfig.getNodeValue("cli.migrationsDir");
                migrationConfig = new JsonFileWriter();
                migrationConfig.openSync('./src/migration/migration.cfg');
                if (!migrationConfig.fileExists) {
                    migrationConfig.setNodeValue('current', 'last');
                }
                ormConfig.saveSync();
                if (!restore) return [3 /*break*/, 9];
                formatMigrationArray = function (array) { return array.map(function (table) { return Object.values(table)[0]; }); };
                return [4 /*yield*/, connection.select('migration_table', ['timestamp', 'name'], "WHERE name LIKE '" + modelName + "%' ORDER BY timestamp DESC")];
            case 3:
                revertTo = (_d.sent())[0];
                dump_1 = fs.readFileSync(migrationDir + "/" + getMigrationFileNameFromRecord(revertTo) + ".sql", 'utf-8');
                return [4 /*yield*/, connection.query("SET FOREIGN_KEY_CHECKS = 0;")];
            case 4:
                _d.sent();
                _a = formatMigrationArray;
                return [4 /*yield*/, connection.getTables()];
            case 5:
                allTables = _a.apply(void 0, [_d.sent()]).filter(function (file) { return file !== 'migration_table'; });
                return [4 /*yield*/, Promise.all(allTables.map(function (table) { return connection.query("TRUNCATE TABLE " + table + ";"); }))];
            case 6:
                _d.sent();
                return [4 /*yield*/, connection.query("SET FOREIGN_KEY_CHECKS = 1;")];
            case 7:
                _d.sent();
                return [4 /*yield*/, connection.query(dump_1)];
            case 8:
                _d.sent();
                return [3 /*break*/, 22];
            case 9:
                if (!isRevert) return [3 /*break*/, 21];
                formatMigrationArray = function (array) { return array.map(function (table) { return Object.values(table)[0]; }); };
                return [4 /*yield*/, Promise.all([
                        connection.select('migration_table', ['timestamp', 'name'], "WHERE name LIKE '" + modelName + "%' ORDER BY timestamp DESC"),
                        migrationConfig.getNodeValue('current') === 'last' ? connection.select('migration_table', ['timestamp', 'name'], "ORDER BY timestamp DESC") : connection.select('migration_table', ['timestamp', 'name'], "WHERE name = '" + migrationConfig.getNodeValue('current') + "' ORDER BY timestamp DESC")
                    ])];
            case 10:
                _b = _d.sent(), revertTo = _b[0][0], current = _b[1][0];
                return [4 /*yield*/, connection.select('migration_table', ['timestamp', 'name'], "WHERE timestamp BETWEEN " + revertTo.timestamp + " AND " + current.timestamp + " ORDER BY timestamp DESC")];
            case 11:
                between = _d.sent();
                if (revertTo.length === 0)
                    throw new Error('Revert migration not found');
                if (revertTo.timestamp >= current.timestamp)
                    throw new Error('You are trying to revert to the same or a newer migration , please do a simple nfw migrate');
                migrationConfig.setNodeValue("current", revertTo.name);
                errors_1 = 0, success_1 = 0;
                return [4 /*yield*/, connection.query("SET FOREIGN_KEY_CHECKS = 0;")];
            case 12:
                _d.sent();
                _i = 0, between_1 = between;
                _d.label = 13;
            case 13:
                if (!(_i < between_1.length)) return [3 /*break*/, 17];
                forMigration = between_1[_i];
                forMigrationFileName = getMigrationFileNameFromRecord(forMigration);
                migrationFile = project.getSourceFile(migrationDir + "/" + forMigrationFileName + ".ts");
                functionText = migrationFile.getClasses()[0].getMethod('down').getText();
                console.log(functionText);
                regexDownStatement = /\"(.*?)\"/gm;
                res = void 0;
                _d.label = 14;
            case 14:
                if (!((res = regexDownStatement.exec(functionText)) !== null)) return [3 /*break*/, 16];
                return [4 /*yield*/, connection.query(res[1])
                        .then(function () {
                        success_1++;
                    })
                        .catch(function (e) {
                        errors_1++;
                    })];
            case 15:
                _d.sent();
                return [3 /*break*/, 14];
            case 16:
                _i++;
                return [3 /*break*/, 13];
            case 17:
                Log.info("\nMigration code executed with " + chalk.red(errors_1.toString()) + " query failed and " + chalk.green(success_1.toString()) + " success in " + chalk.blue(between.length.toString()) + " migration files");
                _c = formatMigrationArray;
                return [4 /*yield*/, connection.getTables()];
            case 18:
                allTables = _c.apply(void 0, [_d.sent()]).filter(function (file) { return file !== 'migration_table'; });
                return [4 /*yield*/, Promise.all(allTables.map(function (table) { return connection.query("TRUNCATE TABLE " + table + ";"); }))];
            case 19:
                _d.sent();
                return [4 /*yield*/, connection.query("SET FOREIGN_KEY_CHECKS = 1;")];
            case 20:
                _d.sent();
                //await connection.query(dump);
                migrationConfig.saveSync();
                return [3 /*break*/, 22];
            case 21:
                typeorm_cli = path.resolve('.', 'node_modules', 'typeorm', 'cli.js');
                ts_node = path.resolve('.', 'node_modules', '.bin', 'ts-node');
                child_process.spawnSync(ts_node + " " + typeorm_cli + " migration:generate -n " + modelName, { stdio: 'inherit', shell: true });
                files = fs.readdirSync(migrationDir, { withFileTypes: true }).filter(function (dirent) { return !dirent.isDirectory(); })
                    .map(function (dirent) { return dirent.name; });
                recentTimestamp = Math.max.apply(null, files.map(function (e) {
                    return parseInt(e.split("-")[0], 10);
                }));
                migrationFile = recentTimestamp + "-" + modelName + ".ts";
                try {
                    child_process.spawnSync(ts_node + " " + typeorm_cli + " migration:run", { stdio: 'inherit', shell: true });
                }
                catch (e) {
                    obj = _buildErrorObjectFromMessage(e);
                    backupDir = "src/migration/" + currentEnv + "/failed";
                    Log.warning("Got some errors in migration , removing and backing up file " + migrationFile + " in " + backupDir);
                    Log.warning(obj.message);
                    fs.renameSync("src/migration/" + currentEnv + "/" + migrationFile, backupDir + "/" + migrationFile);
                }
                migrationConfig.setNodeValue('current', 'last');
                migrationConfig.saveSync();
                _d.label = 22;
            case 22:
                if (!dump) return [3 /*break*/, 25];
                return [4 /*yield*/, connection.select('migration_table', ['timestamp', 'name'], 'ORDER BY timestamp DESC')];
            case 23:
                latest = (_d.sent())[0];
                dumpName = migrationDir + "/" + getMigrationFileNameFromRecord(latest);
                return [4 /*yield*/, connection.dumpAll(dumpName, {
                        dumpOptions: {
                            schema: false,
                            tables: ['migration_table'],
                            excludeTables: true,
                            data: {
                                format: false
                            }
                        }
                    })];
            case 24:
                _d.sent();
                _d.label = 25;
            case 25: return [2 /*return*/, [migrationDir]]; // return migration output path
        }
    });
}); };
