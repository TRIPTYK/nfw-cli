"use strict";
/**
 * @author Verliefden Romain
 * @module editModelAction
 * @description Edit a model
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
// node modules
var stringifyObject = require("stringify-object");
// project modules
var removeFromModel = require("./lib/removeFromModel");
var addInModels = require("./lib/addInModel");
var modelSpecs = require("./lib/modelSpecs");
var Log = require("../utils/log");
var utils_1 = require("../actions/lib/utils");
var project = require("../utils/project");
var chalk_1 = require("chalk");
/**
 * Main function
 * @param {string} action
 * @param {string} model Model name
 * @param {string|null} column Column name
 * @returns {Promise<void>}
 */
var EditModelClass = /** @class */ (function () {
    function EditModelClass(action, model, column) {
        if (column === void 0) { column = null; }
        this.action = action;
        this.model = model;
        this.column = column;
    }
    EditModelClass.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var data, pathModel, entity;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.model = utils_1.format(this.model);
                        if (this.action === 'remove') {
                            removeFromModel.removeFromSerializer(this.model, this.column, ' ', false);
                            removeFromModel.removeRelationFromModelFile(this.model, this.column);
                            //await removeFromModel.removeFromTest(model, column);
                            removeFromModel.removeFromValidation(this.model, this.column);
                            Log.success('Column successfully removed');
                        }
                        if (!(this.action === 'add')) return [3 /*break*/, 2];
                        return [4 /*yield*/, modelSpecs.newColumn(this.column)];
                    case 1:
                        data = _a.sent();
                        pathModel = "src/api/models/" + utils_1.lowercaseEntity(this.model) + ".model.ts";
                        if (data === null)
                            throw new Error('Column cancelled');
                        if (utils_1.columnExist(this.model, data.columns.Field))
                            throw new Error('Column already exist');
                        entity = data.columns;
                        project.getSourceFile(pathModel).getClasses()[0].addProperty({ name: data.columns.Field }).addDecorator({
                            name: 'Column', arguments: stringifyObject(utils_1.buildModelColumnArgumentsFromObject(entity))
                        }).setIsDecoratorFactory(true);
                        addInModels.writeSerializer(this.model, data.columns.Field);
                        addInModels.addToValidations(this.model, data.columns);
                        //await addInModels.addToTest(model,data.columns);
                        Log.info("Column generated in " + chalk_1.default.cyan("src/api/models/" + utils_1.lowercaseEntity(this.model) + ".model.ts"));
                        _a.label = 2;
                    case 2: return [4 /*yield*/, project.save()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    return EditModelClass;
}());
exports.EditModelClass = EditModelClass;
