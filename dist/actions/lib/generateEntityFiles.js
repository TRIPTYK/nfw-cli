"use strict";
/**
 * @module generateEntityFiles
 * @description Generate entity files except model
 * @author Deflorenne Amaury
 * @author Verliefden Romain
 * @author Sam Antoine
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
var project = require("../../utils/project");
// project modules
var Log = require("../../utils/log");
var utils_1 = require("./utils");
// false class properties
var capitalize;
var lowercase;
var controllerTemplateFile = require("../../templates/controller");
var relationsTemplateFile = require("../../templates/relations");
var repositoryTemplateFile = require("../../templates/repository");
var serializerTemplateFile = require("../../templates/serializer");
var validationTemplateFile = require("../../templates/validation");
var schemaTemplateFile = require("../../templates/schema");
var typeTemplateFile = require("../../templates/types");
//Check entity existence, and write file or not according to the context
function main(modelName, crudOptions, data, part) {
    if (data === void 0) { data = null; }
    return __awaiter(this, void 0, void 0, function () {
        var tableColumns, foreignKeys, index, allColumns, files, controllerPath, validationPath, relationPath, repositoryPath, serializerPath, schemaPath, typePath, testPath;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!modelName.length) {
                        Log.error('Nothing to generate. Please, get entity name parameter.');
                        return [2 /*return*/];
                    }
                    // assign false class properties
                    lowercase = utils_1.lowercaseEntity(modelName);
                    capitalize = utils_1.capitalizeEntity(modelName);
                    tableColumns = data ? data.columns : [];
                    foreignKeys = data ? data.foreignKeys : [];
                    index = tableColumns.findIndex(function (el) { return el.Field === 'id'; });
                    // remove id key from array
                    if (index !== -1)
                        tableColumns.splice(tableColumns, 1);
                    allColumns = tableColumns // TODO: do this in view
                        .map(function (elem) { return "'" + elem.Field + "'"; })
                        .concat(foreignKeys.map(function (e) { return "'" + e.COLUMN_NAME + "'"; }));
                    if (data.createUpdate != null && data.createUpdate.createAt)
                        allColumns.push("'createdAt'");
                    if (data.createUpdate != null && data.createUpdate.updateAt)
                        allColumns.push("'updatedAt'");
                    files = [];
                    controllerPath = "src/api/controllers/" + lowercase + ".controller.ts";
                    validationPath = "src/api/validations/" + lowercase + ".validation.ts";
                    relationPath = "src/api/enums/json-api/" + lowercase + ".enum.ts";
                    repositoryPath = "src/api/repositories/" + lowercase + ".repository.ts";
                    serializerPath = "src/api/serializers/" + lowercase + ".serializer.ts";
                    schemaPath = "src/api/serializers/schemas/" + lowercase + ".schema.ts";
                    typePath = "src/api/serializers/schemas/types.ts";
                    testPath = "test/" + lowercase + ".test.ts";
                    typeTemplateFile(typePath, lowercase);
                    if (!part || part === 'controller')
                        files.push(controllerTemplateFile.main(controllerPath, {
                            className: capitalize + "Controller",
                            options: crudOptions,
                            entityName: lowercase
                        }));
                    if (!part || part === 'relation')
                        files.push(relationsTemplateFile(relationPath, {
                            entityName: lowercase,
                            columns: tableColumns
                        }));
                    if (!part || part === 'repository')
                        files.push(repositoryTemplateFile(repositoryPath, {
                            className: capitalize + "Repository",
                            entityName: lowercase
                        }));
                    if (!part || part === 'validation')
                        files.push(validationTemplateFile(validationPath, {
                            options: crudOptions,
                            entityName: lowercase,
                            entities: tableColumns
                        }));
                    if (!part || part === 'schema')
                        files.push(schemaTemplateFile(schemaPath, {
                            className: capitalize + "Schema",
                            entityName: lowercase
                        }));
                    if (!part || part === 'serializer')
                        files.push(serializerTemplateFile(serializerPath, {
                            className: capitalize + "Serializer",
                            entityName: lowercase,
                        }));
                    // auto generate imports
                    files.forEach(function (file) {
                        file.fixMissingImports();
                        Log.success("Created " + file.getFilePath());
                    });
                    /**
                    if (!part || part === 'test') {
                        testTemplateFile(testPath);
                    }**/
                    return [4 /*yield*/, project.save()];
                case 1:
                    /**
                    if (!part || part === 'test') {
                        testTemplateFile(testPath);
                    }**/
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.main = main;
;
