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
var kebab_case_1 = require("@queso/kebab-case");
var pascalcase = require("pascalcase");
var ts_morph_1 = require("ts-morph");
var stringifyObject = require("stringify-object");
var camelCase = require("camelcase");
var Faker = require("faker");
function generateMirageModelAction(model, rows) {
    return __awaiter(this, void 0, void 0, function () {
        var file, className, theClass, elements, data, _i, _a, prop, type, length_1, decorator, args, _b, _c, objectProp, propertyName, index, object, _d, elements_1, _e, name_1, type, length_2, value, ejsTemplateFile, compiled;
        return __generator(this, function (_f) {
            file = project.getSourceFileOrThrow("./src/api/models/" + kebab_case_1.default(model) + ".model.ts");
            className = pascalcase(model);
            theClass = file.getClass(className);
            elements = [];
            data = [];
            for (_i = 0, _a = theClass.getInstanceProperties().filter(function (p) { return p.getName() !== 'id' && p.getDecorator("Column"); }); _i < _a.length; _i++) {
                prop = _a[_i];
                type = void 0;
                length_1 = null;
                decorator = prop.getDecorator("Column");
                args = decorator.getArguments();
                if (args.length === 1) { // @Column({...})
                    for (_b = 0, _c = args[0].getChildrenOfKind(ts_morph_1.SyntaxKind.PropertyAssignment); _b < _c.length; _b++) {
                        objectProp = _c[_b];
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
            console.log(elements);
            for (index = 1; index <= rows; index++) {
                object = { id: index };
                for (_d = 0, elements_1 = elements; _d < elements_1.length; _d++) {
                    _e = elements_1[_d], name_1 = _e.name, type = _e.type, length_2 = _e.length;
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
                data.push(object);
            }
            ejsTemplateFile = fs.readFileSync(__dirname + '/../templates/mirageData.ejs', 'utf-8');
            compiled = ejs.compile(ejsTemplateFile)({
                modelName: theClass.getName(),
                data: stringifyObject(data)
            });
            copy.writeSync(compiled);
            return [2 /*return*/];
        });
    });
}
exports.default = generateMirageModelAction;
