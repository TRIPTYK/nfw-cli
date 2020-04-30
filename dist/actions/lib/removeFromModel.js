"use strict";
/**
 *  @module removeFromModel
 *  @description Remove relation from model
 *  @author Verliefden Romain
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
var Util = require("util");
var FS = require("fs");
var pluralize_1 = require("pluralize");
var chalk_1 = require("chalk");
// promisify
var ReadFile = Util.promisify(FS.readFile);
var WriteFile = Util.promisify(FS.writeFile);
//project modules
var Log = require("../../utils/log");
var project = require("../../utils/project");
var ts_morph_1 = require("ts-morph");
//description :  Remove relationship from serializer and controller
function removeFromRelationTable(entity, column) {
    var relationFile = project.getSourceFile("src/api/enums/json-api/" + entity + ".enum.ts");
    var relationsArrayDeclaration = relationFile.getVariableDeclaration(entity + "Relations").getInitializer();
    // search by Text value
    var index = relationsArrayDeclaration.getElements().findIndex(function (value) {
        return value.getText() === "'" + column + "'" || value.getText() === "'" + pluralize_1.plural(column) + "'";
    });
    if (index !== -1)
        relationsArrayDeclaration.removeElement(index);
    relationFile.fixMissingImports();
    relationFile.fixUnusedIdentifiers();
}
exports.removeFromRelationTable = removeFromRelationTable;
;
/**
 *
 * @param entity
 * @param column
 * @param otherModel
 * @param isRelation
 */
function removeFromSerializer(entity, column, otherModel, isRelation) {
    var serializerFile = project.getSourceFile("src/api/serializers/" + entity + ".serializer.ts");
    var serializerClass = serializerFile.getClasses()[0];
    if (!isRelation) {
        var relationFile = project.getSourceFile("src/api/enums/json-api/" + entity + ".enum.ts");
        var deserializeDeclaration = relationFile.getVariableDeclaration(entity + "Deserialize").getInitializer();
        var serializeDeclaration = relationFile.getVariableDeclaration(entity + "Serialize").getInitializer();
        // search by Text value
        var index = deserializeDeclaration.getElements().findIndex(function (value) {
            return value.getText() === "'" + column + "'" || value.getText() === "'" + pluralize_1.plural(column) + "'";
        });
        if (index !== -1)
            deserializeDeclaration.removeElement(index);
        // search by Text value
        var index2 = serializeDeclaration.getElements().findIndex(function (value) {
            return value.getText() === "'" + column + "'" || value.getText() === "'" + pluralize_1.plural(column) + "'";
        });
        if (index2 !== -1)
            serializeDeclaration.removeElement(index);
        relationFile.fixMissingImports();
        relationFile.fixUnusedIdentifiers();
    }
    else {
        var serializerFile_1 = project.getSourceFile("src/api/serializers/schemas/" + entity + ".serializer.schema.ts");
        var serializerClass_1 = serializerFile_1.getClasses()[0];
        var getter = serializerClass_1.getGetAccessor("schema").getBody();
        var returnStatement = getter.getChildrenOfKind(ts_morph_1.SyntaxKind.ReturnStatement)[0];
        var objectLiteralExpression = returnStatement.getChildrenOfKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression)[0];
        objectLiteralExpression.getProperty("relationships").getInitializer().getProperty(column).remove();
        serializerFile_1.fixMissingImports();
        serializerFile_1.fixUnusedIdentifiers();
    }
    serializerFile.fixMissingImports();
    serializerFile.fixUnusedIdentifiers();
}
exports.removeFromSerializer = removeFromSerializer;
;
function removeFromTest(model, column) {
    return __awaiter(this, void 0, void 0, function () {
        var testPath, regexRandom, regexArray, testFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testPath = process.cwd() + "/test/" + model + ".test.ts";
                    regexRandom = new RegExp("[\\s]" + column + ".*?\\),", 'gm');
                    regexArray = new RegExp(",'" + column + "'|'" + column + "',|'" + column + "'", 'gm');
                    return [4 /*yield*/, ReadFile(testPath, 'utf-8')];
                case 1:
                    testFile = _a.sent();
                    testFile = testFile.replace(regexRandom, '').replace(regexArray, '');
                    return [4 /*yield*/, WriteFile(testPath, testFile).then(function () { return Log.info(chalk_1.default.cyan("test/" + model + ".test.js") + " updated"); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.removeFromTest = removeFromTest;
;
/**
 *
 * @param model
 * @param column
 */
function removeFromValidation(model, column) {
    var relationFile = project.getSourceFile("src/api/validations/" + model + ".validation.ts");
    // all exported const should be validation schema
    var validationDeclarations = relationFile.getVariableDeclarations().filter(function (v) { return v.getVariableStatement().getDeclarationKind() === 'const' && v.getVariableStatement().hasExportKeyword(); });
    validationDeclarations.forEach(function (declaration) {
        var prop = declaration.getInitializer().getProperty(column);
        if (prop)
            prop.remove();
    });
    relationFile.fixMissingImports();
    relationFile.fixUnusedIdentifiers();
}
exports.removeFromValidation = removeFromValidation;
;
function removeRelationFromModelFile(model, column) {
    var modelFile = project.getSourceFile("src/api/models/" + model + ".model.ts");
    var modelClass = modelFile.getClasses()[0];
    var prop = modelClass.getInstanceProperty(function (p) {
        return p.getName() === column || p.getName() === pluralize_1.plural(column);
    });
    if (prop)
        prop.remove();
    modelFile.fixUnusedIdentifiers();
}
exports.removeRelationFromModelFile = removeRelationFromModelFile;
;
