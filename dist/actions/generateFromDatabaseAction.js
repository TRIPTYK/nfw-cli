"use strict";
/**
 * @author Verliefden Romain
 * @module generateFromDatabaseAction
 * @description Get all table from DB then call writeModel method for each table in the database
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
// Project modules
var inquirer_1 = require("../utils/inquirer");
var modelWrite = require("./writeModelAction");
var generateEntityFiles = require("./lib/generateEntityFiles");
var utils = require("./lib/utils");
var Log = require("../utils/log");
var sqlAdaptator_1 = require("../database/sqlAdaptator");
var createRelation = require("./createRelationAction");
var noGenerate = ['user', 'document', 'refresh_token', 'migration_table'];
var GenerateFromDatabaseActionClass = /** @class */ (function () {
    function GenerateFromDatabaseActionClass() {
        var _this = this;
        this._BridgingTableHander = function (Bridgings) { return __awaiter(_this, void 0, void 0, function () {
            var inquirer, j, _a, m1Name, m2Name;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        inquirer = new inquirer_1.Inquirer();
                        j = 0;
                        _b.label = 1;
                    case 1:
                        if (!(j < Bridgings.length)) return [3 /*break*/, 5];
                        Log.info("a reliationship has been detected between " + Bridgings[j][0].REFERENCED_TABLE_NAME + " and " + Bridgings[j][1].REFERENCED_TABLE_NAME);
                        return [4 /*yield*/, inquirer.questionM1M2(Bridgings[j][0].REFERENCED_TABLE_NAME, Bridgings[j][1].REFERENCED_TABLE_NAME)];
                    case 2:
                        _a = _b.sent(), m1Name = _a.m1Name, m2Name = _a.m2Name;
                        return [4 /*yield*/, new createRelation.CreateRelationActionClass(Bridgings[j][0].REFERENCED_TABLE_NAME, Bridgings[j][1].REFERENCED_TABLE_NAME, 'mtm', Bridgings[j][0].TABLE_NAME, null, m1Name, m2Name)
                                .main()
                                .then(function () { return Log.success("Relation successfully added !"); })
                                .catch(function (err) { return Log.error(err.message); })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        j++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        this._RelationHandler = function (foreignConstraint) { return __awaiter(_this, void 0, void 0, function () {
            var inquirer, j, response, _a, m1Name, m2Name;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        inquirer = new inquirer_1.Inquirer();
                        j = 0;
                        _b.label = 1;
                    case 1:
                        if (!(j < foreignConstraint.length)) return [3 /*break*/, 6];
                        if (noGenerate.includes(foreignConstraint[j].TABLE_NAME) && noGenerate.includes(foreignConstraint[j].REFERENCED_TABLE_NAME))
                            return [3 /*break*/, 5];
                        return [4 /*yield*/, inquirer.askForeignKeyRelation(foreignConstraint[j])];
                    case 2:
                        response = (_b.sent()).response;
                        return [4 /*yield*/, inquirer.questionM1M2(foreignConstraint[j].TABLE_NAME, foreignConstraint[j].REFERENCED_TABLE_NAME)];
                    case 3:
                        _a = _b.sent(), m1Name = _a.m1Name, m2Name = _a.m2Name;
                        return [4 /*yield*/, new createRelation.CreateRelationActionClass(foreignConstraint[j].TABLE_NAME, foreignConstraint[j].REFERENCED_TABLE_NAME, response, m2Name, foreignConstraint[j].REFERENCED_COLUMN_NAME, m1Name, m2Name)
                                .main()
                                .then(function () { return Log.success("Relation successfully added !"); })
                                .catch(function (err) { return Log.error(err.message); })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        j++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
    }
    GenerateFromDatabaseActionClass.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sqlAdaptor, databaseName, p_tables, p_tablesIn, Bridgings, foreignConstraint, _a, tables, tablesIn, crudOptions, j, _b, columns, foreignKeys, entityModelData, j_1, j_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, sqlAdaptator_1.getSqlConnectionFromNFW()];
                    case 1:
                        sqlAdaptor = _c.sent();
                        databaseName = sqlAdaptor.environement.TYPEORM_DB;
                        p_tables = sqlAdaptor.getTables();
                        p_tablesIn = "Tables_in_" + databaseName;
                        Bridgings = [], foreignConstraint = [];
                        return [4 /*yield*/, Promise.all([p_tables, p_tablesIn])];
                    case 2:
                        _a = _c.sent(), tables = _a[0], tablesIn = _a[1];
                        crudOptions = {
                            create: true,
                            read: true,
                            update: true,
                            delete: true
                        };
                        j = 0;
                        _c.label = 3;
                    case 3:
                        if (!(j < tables.length)) return [3 /*break*/, 8];
                        return [4 /*yield*/, sqlAdaptor.getTableInfo(tables[j][tablesIn])];
                    case 4:
                        _b = _c.sent(), columns = _b.columns, foreignKeys = _b.foreignKeys;
                        entityModelData = { columns: columns, foreignKeys: foreignKeys };
                        if (utils.isBridgindTable(entityModelData)) {
                            Bridgings.push(foreignKeys);
                            return [3 /*break*/, 7];
                        }
                        for (j_1 = 0; j_1 < columns.length; j_1++)
                            columns[j_1].Type = utils.sqlTypeData(columns[j_1].Type);
                        for (j_2 = 0; j_2 < foreignKeys.length; j_2++)
                            foreignConstraint.push(foreignKeys[j_2]);
                        if (noGenerate.includes(tables[j][tablesIn]))
                            return [3 /*break*/, 7];
                        return [4 /*yield*/, modelWrite.writeModel(tables[j][tablesIn], entityModelData)
                                .catch(function (e) {
                                Log.error("Failed to generate model : " + e.message + "\nExiting ...");
                                process.exit(1);
                            })];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, generateEntityFiles.main(tables[j][tablesIn], crudOptions, entityModelData)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7:
                        j++;
                        return [3 /*break*/, 3];
                    case 8: return [4 /*yield*/, this._BridgingTableHander(Bridgings)];
                    case 9:
                        _c.sent();
                        return [4 /*yield*/, this._RelationHandler(foreignConstraint)];
                    case 10:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    return GenerateFromDatabaseActionClass;
}());
exports.GenerateFromDatabaseActionClass = GenerateFromDatabaseActionClass;
