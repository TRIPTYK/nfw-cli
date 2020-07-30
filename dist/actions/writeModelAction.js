"use strict";
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
exports.basicModel = exports.writeModel = void 0;
/**
 * @module writeModelAction
 * @author Verliefden Romain
 * @author Deflorenne Amaury
 * @description this module write the model.ts based on columns of the database
 * if the table exist. If the table doesn't exist , the user enter the columns of
 * the future table and the table is created in the database.
 */
var project = require("../utils/project");
var model_1 = require("../templates/model");
var kebab_case_1 = require("@queso/kebab-case");
//action: modelName
//Description : write a typeorm model from an array of info about an entity
function writeModel(modelName, data, dbType) {
    if (data === void 0) { data = null; }
    return __awaiter(this, void 0, void 0, function () {
        var columns, foreignKeys;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    columns = data.columns, foreignKeys = data.foreignKeys;
                    /*
                         filter the foreign keys from columns , they are not needed anymore
                         Only when imported by database
                    */
                    columns = columns.filter(function (column) {
                        return foreignKeys.find(function (elem) { return elem.COLUMN_NAME === column.Field; }) === undefined;
                    }).filter(function (col) { return col.Field !== "id"; });
                    model_1.default("src/api/models/" + kebab_case_1.default(modelName) + ".model.ts", modelName, {
                        entities: columns
                    }, dbType);
                    return [4 /*yield*/, project.save()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.writeModel = writeModel;
;
//Description : creates a basic model , with no entites , imports or foreign keys
function basicModel(modelName, dbType) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    model_1.default("src/api/models/" + kebab_case_1.default(modelName) + ".model.ts", modelName, {
                        entities: []
                    }, dbType);
                    return [4 /*yield*/, project.save()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.basicModel = basicModel;
;
