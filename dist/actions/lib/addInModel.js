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
exports.writeSerializer = exports.addToTest = exports.addToValidations = void 0;
var Util = require("util");
var Log = require("../../utils/log");
var FS = require("fs");
var chalk_1 = require("chalk");
var kebab = require("dashify");
var stringifyObject = require("stringify-object");
var ReadFile = Util.promisify(FS.readFile);
var WriteFile = Util.promisify(FS.writeFile);
var utils_1 = require("./utils");
var project = require("../../utils/project");
function addToValidations(model, column) {
    var file = project.getSourceFile("src/api/validations/" + model + ".validation.ts");
    // all exported const should be validation schema
    var validationDeclarations = file.getVariableDeclarations().filter(function (v) { return v.getVariableStatement().getDeclarationKind() === 'const' && v.getVariableStatement().hasExportKeyword(); });
    validationDeclarations.forEach(function (declaration) {
        if (declaration.getName().includes('update'))
            declaration.getInitializer().addPropertyAssignment({
                name: column.Field,
                initializer: stringifyObject(utils_1.buildValidationArgumentsFromObject(column, true))
            });
        if (declaration.getName().includes('create') || declaration.getName().includes('replace'))
            declaration.getInitializer().addPropertyAssignment({
                name: column.Field,
                initializer: stringifyObject(utils_1.buildValidationArgumentsFromObject(column))
            });
    });
}
exports.addToValidations = addToValidations;
;
function addToTest(model, column) {
    return __awaiter(this, void 0, void 0, function () {
        var testPath, testFile, rgxRandomType, toPutRandType, rgxList, regexMatch, toPutInList, regexRandom, regexArray;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testPath = process.cwd() + "/test/" + model + ".test.ts";
                    return [4 /*yield*/, ReadFile(testPath, 'utf-8')];
                case 1:
                    testFile = _a.sent();
                    rgxRandomType = new RegExp("(.send\\({[\\s\\S]*?)()(})", 'gm');
                    if (column.Type.length === undefined)
                        column.Type.length = '';
                    if (column.Type.type === 'enum')
                        column.Type.length = "[" + column.Type.length + "]";
                    toPutRandType = "       " + column.Field + " : fixtures.random" + column.Type.type + "(" + column.Type.length + "),";
                    rgxList = new RegExp("(expect\\(res.body[\\s\\S]*?')([\\s\\n\\r])", 'gm');
                    regexMatch = testFile.match(rgxList);
                    if (regexMatch[2].includes('\''))
                        toPutInList = ",'" + kebab(column.Field) + "'\n";
                    else
                        toPutInList = "" + kebab(column.Field);
                    regexRandom = new RegExp("[\\s]" + column.Field + ".*?,", 'gm');
                    regexArray = new RegExp(",'" + column.Field + "'|'" + column.Field + "',|'" + column.Field + "'", 'gm');
                    if (!testFile.match(regexRandom))
                        testFile = testFile.replace(rgxRandomType, "$1" + toPutRandType + "\n$3");
                    if (!testFile.match(regexArray))
                        testFile = testFile.replace(rgxList, "$1" + toPutInList);
                    return [4 /*yield*/, WriteFile(testPath, testFile).then(function () { return Log.info(chalk_1.default.cyan("test/" + model + ".test.ts") + " updated"); })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.addToTest = addToTest;
;
function writeSerializer(model, column) {
    var relationFile = project.getSourceFile("src/api/enums/json-api/" + model + ".enum.ts");
    relationFile.getVariableDeclaration(model + "Serialize").getInitializer().addElement("'" + column + "'");
    relationFile.getVariableDeclaration(model + "Deserialize").getInitializer().addElement("'" + column + "'");
    relationFile.fixMissingImports();
    relationFile.fixUnusedIdentifiers();
}
exports.writeSerializer = writeSerializer;
;
