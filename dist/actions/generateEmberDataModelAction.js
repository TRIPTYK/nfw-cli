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
var project = require("../utils/project");
var fs = require("fs");
var copy = require("clipboardy");
var ejs = require("ejs");
var GenerateEmberDataModelActionClass = /** @class */ (function () {
    function GenerateEmberDataModelActionClass(model) {
        this.model = model;
    }
    GenerateEmberDataModelActionClass.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            var file, theClass, elements, _i, _a, prop, decorator, DSfncName, argument, argType, foundType, argumentType, argumentType, ejsTemplateFile, compiled;
            return __generator(this, function (_b) {
                file = project.getSourceFileOrThrow("./src/api/models/" + this.model + ".model.ts");
                theClass = file.getClasses()[0];
                elements = [];
                for (_i = 0, _a = theClass.getInstanceProperties().filter(function (p) { return p.getName() !== 'id'; }); _i < _a.length; _i++) {
                    prop = _a[_i];
                    decorator = prop.getDecorators()[0];
                    if (decorator) {
                        DSfncName = decorator.getName();
                        if (['OneToMany', 'ManyToMay'].includes(DSfncName)) {
                            DSfncName = 'hasMany';
                        }
                        else if (['ManyToOne', 'OneToOne'].includes(DSfncName)) {
                            DSfncName = 'belongsTo';
                        }
                        else {
                            DSfncName = 'attr';
                        }
                        argument = decorator.getArguments()[0];
                        argType = null;
                        if (DSfncName === 'attr' && argument) {
                            if (argument.getProperties) {
                                foundType = argument.getProperty('type');
                                if (foundType) {
                                    argumentType = foundType.getInitializer().getText();
                                    if (['varchar', 'text', 'char'].includes(argumentType)) {
                                        argType = '"string"';
                                    }
                                    else if (['Date'].includes(argumentType)) {
                                        argType = '"date"';
                                    }
                                }
                                else {
                                    argumentType = prop.getType().getText();
                                    if (['string'].includes(argumentType)) {
                                        argType = '"string"';
                                    }
                                    else if (['number'].includes(argumentType)) {
                                        argType = '"number"';
                                    }
                                    else if (['date', 'datetime'].includes(argumentType)) {
                                        argType = '"date"';
                                    }
                                }
                            }
                        }
                        if (DSfncName !== 'attr' && argument) {
                            argType = "\"" + argument.getBodyText().toLowerCase() + "\"";
                        }
                        elements.push({
                            property: prop.getName(),
                            function: DSfncName,
                            arg: argType
                        });
                    }
                }
                ejsTemplateFile = fs.readFileSync(__dirname + '/templates/emberModel.ejs', 'utf-8');
                compiled = ejs.compile(ejsTemplateFile)({
                    modelName: theClass.getName(),
                    elements: elements
                });
                copy.writeSync(compiled);
                return [2 /*return*/];
            });
        });
    };
    return GenerateEmberDataModelActionClass;
}());
exports.GenerateEmberDataModelActionClass = GenerateEmberDataModelActionClass;
