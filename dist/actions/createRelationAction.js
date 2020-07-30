"use strict";
/**
 * @module createRelationAction
 * @author Verliefden Romain
 * @description creates relationship between 2 models
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
exports.CreateRelationActionClass = void 0;
// node modules
var pluralize_1 = require("pluralize");
var stringifyObject = require("stringify-object");
var kebab_case_1 = require("@queso/kebab-case");
// project object
var project = require("../utils/project");
var Log = require("../utils/log");
// project modules
var utils_1 = require("./lib/utils");
var ts_morph_1 = require("ts-morph");
var CreateRelationActionClass = /** @class */ (function () {
    function CreateRelationActionClass(model1, model2, relation, name, refCol, m1Name, m2Name) {
        var _this = this;
        //description : build the string to write in a model for many to many relationship
        this._Mtm = function (modelClass, model1, model2, isFirst, name, m1Name, m2Name) {
            var prop = modelClass.addProperty({ name: pluralize_1.plural(m2Name), type: utils_1.capitalizeEntity(model2) + "[]" });
            var args = {};
            prop.addDecorator({ name: "ManyToMany", arguments: ["type => " + utils_1.capitalizeEntity(model2), model2 + " => " + model2 + "." + pluralize_1.plural(m1Name)] }).setIsDecoratorFactory(true);
            if (name)
                args['name'] = name;
            if (isFirst)
                prop.addDecorator({ name: "JoinTable", arguments: [stringifyObject(args)] }).setIsDecoratorFactory(true);
            return prop.getName();
        };
        //description : build the string to write in a model for one to one relationship
        //name: name of the foreignKey in the table
        //refCol the column referenced in the foreign key
        //isFirst First in the relationship
        this._Oto = function (modelClass, model1, model2, isFirst, name, refCol, m1Name, m2Name) {
            var prop = modelClass.addProperty({ name: m2Name, type: utils_1.capitalizeEntity(model2) });
            var args = {};
            if (name)
                args['name'] = name;
            if (refCol)
                args['referencedColumnName'] = refCol;
            prop.addDecorator({ name: "OneToOne", arguments: ["type => " + utils_1.capitalizeEntity(model2), model2 + " => " + model2 + "." + m1Name] }).setIsDecoratorFactory(true);
            if (isFirst)
                prop.addDecorator({ name: "JoinColumn", arguments: [stringifyObject(args)] }).setIsDecoratorFactory(true);
            return prop.getName();
        };
        //description : build the string to write in a model for one to many relationship
        this._Otm = function (modelClass, model1, model2, isFirst, m1Name, m2Name) {
            var prop;
            if (isFirst) {
                prop = modelClass.addProperty({ name: pluralize_1.plural(m2Name), type: utils_1.capitalizeEntity(model2) + "[]" });
                prop.addDecorator({
                    name: "OneToMany",
                    arguments: ["type => " + utils_1.capitalizeEntity(model2), model2 + " => " + model2 + "." + m1Name]
                }).setIsDecoratorFactory(true);
            }
            else {
                prop = modelClass.addProperty({ name: m2Name, type: utils_1.capitalizeEntity(model2) });
                prop.addDecorator({
                    name: "ManyToOne",
                    arguments: ["type => " + utils_1.capitalizeEntity(model2), model2 + " => " + model2 + "." + pluralize_1.plural(m1Name)]
                }).setIsDecoratorFactory(true);
            }
            return prop.getName();
        };
        //description : build the string to write in a model for one to many relationship
        this._Mto = function (modelClass, model1, model2, isFirst, m1Name, m2Name) {
            var prop;
            if (isFirst) {
                prop = modelClass.addProperty({ name: m2Name, type: utils_1.capitalizeEntity(model2) });
                prop.addDecorator({
                    name: "ManyToOne",
                    arguments: ["type => " + utils_1.capitalizeEntity(model2), model2 + " => " + model2 + "." + pluralize_1.plural(m1Name)]
                }).setIsDecoratorFactory(true);
            }
            else {
                prop = modelClass.addProperty({ name: pluralize_1.plural(m2Name), type: utils_1.capitalizeEntity(model2) + "[]" });
                prop.addDecorator({
                    name: "OneToMany",
                    arguments: ["type => " + utils_1.capitalizeEntity(model2), model2 + " => " + model2 + "." + m1Name]
                }).setIsDecoratorFactory(true);
            }
            return prop.getName();
        };
        //description : Define which relation need to be written in the model
        //refCol  for Oto only , name of the referenced column in the foreign key (must be primary or unique)
        //name either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
        //isFirst Does he carry the foreignKey (Oto) or assure that you write JoinTable only in one side of the relation for mtm
        this._addRelation = function (model1, model2, isFirst, relation, name, refCol, m1Name, m2Name) {
            var addedPropertyName;
            var modelFile = project.getSourceFile("src/api/models/" + kebab_case_1.default(model1) + ".model.ts");
            var modelClass = modelFile.getClasses()[0];
            if (relation === 'mtm')
                addedPropertyName = _this._Mtm(modelClass, model1, model2, isFirst, name, m1Name, m2Name);
            if (relation === 'oto')
                addedPropertyName = _this._Oto(modelClass, model1, model2, isFirst, name, refCol, m1Name, m2Name);
            if (relation === 'otm')
                addedPropertyName = _this._Otm(modelClass, model1, model2, isFirst, m1Name, m2Name);
            if (relation === 'mto')
                addedPropertyName = _this._Mto(modelClass, model1, model2, isFirst, m1Name, m2Name);
            modelFile.fixMissingImports();
            Log.info("Updated " + modelFile.getFilePath());
            _this.addToSerializer(model1, addedPropertyName, model2, m1Name, m2Name);
            _this.addToRelation(model1, addedPropertyName, model2);
        };
        this.model1 = model1;
        this.model2 = model2;
        this.relation = relation;
        this.name = name;
        this.refCol = refCol;
        this.m1Name = m1Name;
        this.m2Name = m2Name;
    }
    //description : Create a relationship between 2 models
    //relation : the relation you want between the two models
    //name : either the name of the foreign key (for oto) or the name of the bridging table (for mtm)
    //refCol : for Oto only , name of the referenced column in the foreign key (must be primary or unique)
    CreateRelationActionClass.prototype.main = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!utils_1.modelFileExists(this.model1) || !utils_1.modelFileExists(this.model2))
                            throw new Error("Both model should exist in order to create a many to many relationship");
                        if (utils_1.columnExist(this.model1, this.m2Name) || utils_1.columnExist(this.model2, this.m1Name) || utils_1.relationExist(this.model1, this.m2Name) || utils_1.relationExist(this.model2, this.m1Name))
                            throw new Error("A Column have a name that conflicts with the creation of the relationship in one or both models \n Please use m1Name and m2Name option");
                        this._addRelation(this.model1, this.model2, true, this.relation, this.name, this.refCol, this.m1Name, this.m2Name);
                        this._addRelation(this.model2, this.model1, false, this.relation, this.name, this.refCol, this.m2Name, this.m1Name);
                        return [4 /*yield*/, project.save()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // TODO : fix relations adding l
    //description : add relationship in the serializer of an entity
    CreateRelationActionClass.prototype.addToSerializer = function (entity, column, model, m1Name, m2Name) {
        var serializerFile = project.getSourceFile("src/api/serializers/schemas/" + entity + ".serializer.schema.ts");
        var serializerClass = serializerFile.getClasses()[0];
        var getter = serializerClass.getGetAccessor("schema").getBody();
        var returnStatement = getter.getChildrenOfKind(ts_morph_1.SyntaxKind.ReturnStatement)[0];
        var objectLiteralExpression = returnStatement.getChildrenOfKind(ts_morph_1.SyntaxKind.ObjectLiteralExpression)[0];
        objectLiteralExpression.getProperty("relationships").getInitializer().addPropertyAssignment({
            name: column,
            initializer: "{\ntype : " + utils_1.capitalizeEntity(model) + "SerializerSchema.type,\nwhitelist : " + utils_1.capitalizeEntity(model) + "SerializerSchema.serialize\n}"
        });
        serializerFile.fixMissingImports();
        serializerFile.fixUnusedIdentifiers();
        Log.info("Updated " + serializerFile.getFilePath());
    };
    ;
    //Description : add relationship in the controller of an entity
    CreateRelationActionClass.prototype.addToRelation = function (entity, column, otherModel) {
        var relationFile = project.getSourceFile("src/api/enums/json-api/" + entity + ".enum.ts");
        if (!relationFile) {
            Log.info("Cannot find relation enum file , skiping ...");
            return;
        }
        relationFile.getVariableDeclaration(entity + "Relations").getInitializer().addElement("'" + column + "'");
        relationFile.fixMissingImports();
        relationFile.fixUnusedIdentifiers();
        Log.info("Updated " + relationFile.getFilePath());
    };
    ;
    return CreateRelationActionClass;
}());
exports.CreateRelationActionClass = CreateRelationActionClass;
