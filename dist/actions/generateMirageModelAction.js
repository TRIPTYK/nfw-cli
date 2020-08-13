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
exports.generateModelData = void 0;
var project = require("../utils/project");
var fs = require("fs");
var ejs = require("ejs");
var kebab_case_1 = require("@queso/kebab-case");
var pascalcase = require("pascalcase");
var ts_morph_1 = require("ts-morph");
var stringifyObject = require("stringify-object");
var camelCase = require("camelcase");
var Faker = require("faker");
var mkdirp = require("mkdirp");
var fs_1 = require("fs");
var pluralize_1 = require("pluralize");
function generateModelData(file, model, rows) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function () {
        var className, theClass, elements, data, relations, _i, _c, prop, type, length_1, columnDecorator, args, _d, _e, objectProp, propertyName, relationDecorator, _f, typeArg, propertyArg, type_1, body, key, index, object, _g, elements_1, _h, name_1, type, length_2, value, _j, relations_1, _k, name_2, type, relationType, array, max, ejsTemplateFile, compiled;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    className = pascalcase(model);
                    theClass = file.getClasses()[0];
                    elements = [];
                    data = [];
                    relations = [];
                    for (_i = 0, _c = theClass.getInstanceProperties().filter(function (p) { return p.getName() !== 'id'; }); _i < _c.length; _i++) {
                        prop = _c[_i];
                        type = void 0;
                        length_1 = null;
                        columnDecorator = prop.getDecorator("Column");
                        if (columnDecorator) {
                            args = columnDecorator.getArguments();
                            if (args.length === 1) { // @Column({...})
                                for (_d = 0, _e = args[0].getChildrenOfKind(ts_morph_1.SyntaxKind.PropertyAssignment); _d < _e.length; _d++) {
                                    objectProp = _e[_d];
                                    propertyName = objectProp.getFirstChildByKindOrThrow(ts_morph_1.SyntaxKind.Identifier).getText();
                                    if (propertyName === "type") {
                                        type = objectProp.getInitializer().getText();
                                    }
                                    if (propertyName === "length") {
                                        length_1 = objectProp.getInitializer().getText();
                                    }
                                }
                            }
                            else if (args.length === 2) { // @Column("blah",{...})
                                type = args[0].getText();
                            }
                            if (!type) {
                                type = prop.getType().getText();
                            }
                            elements.push({ name: prop.getName(), type: type, length: length_1 });
                        }
                        relationDecorator = (_b = (_a = prop.getDecorator("ManyToMany")) !== null && _a !== void 0 ? _a : prop.getDecorator("OneToMany")) !== null && _b !== void 0 ? _b : prop.getDecorator("OneToOne");
                        if (relationDecorator && relationDecorator.getName() === "OneToOne" && !prop.getDecorator("JoinColumn")) {
                            relationDecorator = null;
                        }
                        if (relationDecorator) {
                            _f = relationDecorator.getArguments(), typeArg = _f[0], propertyArg = _f[1];
                            type_1 = typeArg.getBodyText();
                            body = propertyArg.getBody();
                            key = body.getLastChildByKind(ts_morph_1.SyntaxKind.Identifier).getText();
                            relations.push({
                                name: prop.getName(),
                                key: key,
                                type: type_1,
                                relationType: relationDecorator.getName()
                            });
                        }
                    }
                    for (index = 1; index <= rows; index++) {
                        object = { id: index };
                        for (_g = 0, elements_1 = elements; _g < elements_1.length; _g++) {
                            _h = elements_1[_g], name_1 = _h.name, type = _h.type, length_2 = _h.length;
                            value = null;
                            // arma 3 like syntax
                            switch (true) {
                                case ["string", "varchar"].includes(type):
                                    value = Faker.lorem.text().substr(0, length_2 !== null && length_2 !== void 0 ? length_2 : 255);
                                    break;
                                case ["Date", "timestamp", "datetime", "date"].includes(type):
                                    value = Faker.date.recent();
                                    break;
                                case ["text"].includes(type):
                                    value = Faker.lorem.text();
                                    break;
                                case ['"simple-enum"', '"enum"'].includes(type):
                                    value = Faker.lorem.word();
                                    break;
                                case ["number", "integer", "float", "decimal"].includes(type):
                                    value = Faker.random.number(255);
                                    break;
                                case ["boolean"].includes(type):
                                    value = Faker.random.boolean();
                                    break;
                            }
                            object[camelCase(name_1)] = value;
                        }
                        for (_j = 0, relations_1 = relations; _j < relations_1.length; _j++) {
                            _k = relations_1[_j], name_2 = _k.name, type = _k.type, relationType = _k.relationType;
                            if (relationType === "ManyToMany" || relationType === "OneToMany") {
                                array = object[camelCase(name_2) + "Ids"] = [];
                                while (array.length < rows) {
                                    max = Faker.random.number(rows - 1) + 1;
                                    array.push(max);
                                }
                            }
                            else {
                                object[camelCase(name_2) + "Id"] = Faker.random.number(rows - 1) + 1;
                            }
                        }
                        data.push(object);
                    }
                    ejsTemplateFile = fs.readFileSync(__dirname + '/../templates/mirageData.ejs', 'utf-8');
                    compiled = ejs.compile(ejsTemplateFile)({
                        modelName: theClass.getName(),
                        data: stringifyObject(data)
                    });
                    return [4 /*yield*/, mkdirp("fixtures")];
                case 1:
                    _l.sent();
                    fs_1.writeFileSync("fixtures/" + kebab_case_1.default(pluralize_1.plural(model)) + ".js", compiled);
                    return [2 /*return*/];
            }
        });
    });
}
exports.generateModelData = generateModelData;
function generateMirageModelAction(model, rows, excludedModels) {
    if (excludedModels === void 0) { excludedModels = []; }
    return __awaiter(this, void 0, void 0, function () {
        var file, _i, _a, file;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!model) return [3 /*break*/, 2];
                    file = project.getSourceFileOrThrow("./src/api/models/" + kebab_case_1.default(model) + ".model.ts");
                    return [4 /*yield*/, generateModelData(file, model, rows)];
                case 1:
                    _b.sent();
                    return [3 /*break*/, 6];
                case 2:
                    _i = 0, _a = project.getSourceFiles("./src/api/models/*.model.ts").filter(function (modelFile) {
                        return !excludedModels.includes(modelFile.getBaseNameWithoutExtension().replace(".model", ""));
                    });
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    file = _a[_i];
                    console.log(file.getBaseNameWithoutExtension());
                    return [4 /*yield*/, generateModelData(file, file.getBaseNameWithoutExtension().replace(".model", ""), rows)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    });
}
exports.default = generateMirageModelAction;
