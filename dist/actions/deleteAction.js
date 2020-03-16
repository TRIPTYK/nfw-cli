"use strict";
/**
 * @module delete
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 * @description Delete entity files
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
var child_process = require("child_process");
var snake = require("to-snake-case");
var JsonFileWriter = require("json-file-rw");
var Log = require("../utils/log");
var resources_1 = require("../static/resources");
var utils_1 = require("./lib/utils");
var removeRelationAction_1 = require("./removeRelationAction");
var project = require("../utils/project");
var mongoAdaptator_1 = require("../database/mongoAdaptator");
var sqlAdaptator_1 = require("../database/sqlAdaptator");
var DatabaseEnv_1 = require("../database/DatabaseEnv");
// simulate class properties
var capitalize;
var lowercase;
/**
 *  @description deletes typescript files
 *  @returns {Promise<Array>}
 */
var _deleteTypescriptFiles = function () { return __awaiter(void 0, void 0, void 0, function () {
    var deleted, i, item, file;
    return __generator(this, function (_a) {
        deleted = [];
        for (i = 0; i < resources_1.items.length; i++) {
            item = resources_1.items[i];
            file = project.getSourceFile(item.path + "/" + lowercase + "." + item.template + ".ts");
            if (file) {
                deleted.push({ fileName: item.path + "/" + lowercase + "." + item.template + ".ts", type: 'delete' });
                file.delete();
            }
        }
        return [2 /*return*/, deleted];
    });
}); };
/**
 * @description Module export main entry , it deletes generated files
 * @param {string} entityName
 * @param {boolean} drop if true , drop the table in database
 * @returns {Promise<Array>}
 */
var DeleteActionClass = /** @class */ (function () {
    function DeleteActionClass(databaseStrategy, entityName, drop) {
        this.databaseStrategy = databaseStrategy;
        this.entityName = entityName;
        this.drop = drop;
    }
    DeleteActionClass.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var nfwConfig, currentEnv, envValues, dumpPath, databaseConnection, relations, i, promises, results, modifiedFiles;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.entityName = snake(this.entityName);
                        //constructor behavior
                        capitalize = utils_1.capitalizeEntity(this.entityName);
                        lowercase = utils_1.lowercaseEntity(this.entityName);
                        nfwConfig = new JsonFileWriter();
                        nfwConfig.openSync(".nfw");
                        currentEnv = nfwConfig.getNodeValue("env", "development");
                        envValues = new DatabaseEnv_1.DatabaseEnv(currentEnv + ".env").getEnvironment();
                        dumpPath = "./dist/migration/dump/" + +new Date() + "-" + this.entityName;
                        return [4 /*yield*/, this.databaseStrategy.getConnectionFromNFW()];
                    case 1:
                        databaseConnection = _a.sent();
                        if (!(this.databaseStrategy instanceof sqlAdaptator_1.SqlConnection)) return [3 /*break*/, 6];
                        return [4 /*yield*/, databaseConnection.getForeignKeysRelatedTo(this.entityName).catch(function (err) {
                                throw new Error("Failed to get foreign keys related to " + _this.entityName + err);
                            })];
                    case 2:
                        relations = _a.sent();
                        i = 0;
                        _a.label = 3;
                    case 3:
                        if (!(i < relations.length)) return [3 /*break*/, 6];
                        return [4 /*yield*/, new removeRelationAction_1.RemoveRelationActionClass(relations[i].TABLE_NAME, relations[i].REFERENCED_TABLE_NAME, relations[i].TABLE_NAME /*, relations[i].REFERENCED_TABLE_NAME*/)
                                .main()
                                .catch(function () { })];
                    case 4:
                        _a.sent(); // not a problem
                        _a.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6:
                        promises = [
                            _deleteTypescriptFiles(),
                        ];
                        return [4 /*yield*/, Promise.all(promises)];
                    case 7:
                        results = _a.sent();
                        modifiedFiles = [];
                        results.forEach(function (e) {
                            modifiedFiles = modifiedFiles.concat(e);
                        });
                        return [4 /*yield*/, databaseConnection.tableExists(this.entityName)];
                    case 8:
                        if (!((_a.sent()) && this.drop)) return [3 /*break*/, 12];
                        if (this.databaseStrategy instanceof mongoAdaptator_1.MongoConnection) {
                            child_process.spawnSync("mongodump --host=" + envValues.TYPEORM_HOST + " --port=" + envValues.TYPEORM_PORT + " --username=" + envValues.TYPEORM_USER + " --password=" + envValues.TYPEORM_PWD + " --db=" + envValues.TYPEORM_DB + " --authenticationDatabase=admin --collection=" + this.entityName + " -o ./dist/migration/dump", { stdio: 'inherit', shell: true });
                        }
                        if (!(this.databaseStrategy instanceof sqlAdaptator_1.SqlConnection)) return [3 /*break*/, 10];
                        return [4 /*yield*/, databaseConnection.dumpTable(dumpPath, this.entityName)
                                .then(function () { return Log.success("SQL dump created at : " + dumpPath); })
                                .catch(function () {
                                throw new Error("Failed to create dump");
                            })];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10: return [4 /*yield*/, databaseConnection.dropTable(this.entityName)
                            .then(function () { return Log.success("Table/Collection dropped"); })
                            .catch(function () { return Log.error("Failed to delete table/Collection"); })];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12: return [4 /*yield*/, project.save()];
                    case 13:
                        _a.sent();
                        return [2 /*return*/, modifiedFiles];
                }
            });
        });
    };
    ;
    return DeleteActionClass;
}());
exports.DeleteActionClass = DeleteActionClass;
